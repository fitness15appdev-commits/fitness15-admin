/**
 * Google Apps Script Code for Fitness 15 Gym Admin
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Name the first sheet "Members" (or update the sheet name in the code below)
 * 3. Go to Extensions > Apps Script
 * 4. Delete the default code and paste this entire code
 * 5. Update the SHEET_NAME variable if your sheet has a different name
 * 6. Click "Deploy" > "New deployment"
 * 7. Select type: "Web app"
 * 8. Execute as: "Me"
 * 9. Who has access: "Anyone" (or "Anyone with Google account" if you want to restrict)
 * 10. Click "Deploy"
 * 11. Copy the Web App URL and paste it in AddMemberForm.jsx (replace YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE)
 * 12. Click "Authorize access" when prompted and grant permissions
 */

// Configuration
const SHEET_NAME = "Members"; // Change this to match your sheet name
const SPREADSHEET_ID = ""; // Optional: Leave empty to use active spreadsheet, or paste your spreadsheet ID

/**
 * Main function to handle GET requests (more reliable with Google Apps Script Web Apps)
 */
function doGet(e) {
  try {
    // Get the spreadsheet
    const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = ss.insertSheet(SHEET_NAME);
      setupSheetHeaders(newSheet);
      return createResponse(true, "Sheet created successfully");
    }
    
    // Handle the request - get parameters from URL
    const action = e.parameter.action;
    
    if (action === "addMember") {
      const memberData = {
        name: e.parameter.name,
        number: e.parameter.number,
        membershipType: e.parameter.membershipType,
        duration: e.parameter.duration,
        membershipFees: e.parameter.membershipFees,
        paymentType: e.parameter.paymentType,
        nextPayment: e.parameter.nextPayment,
        paymentDueDate: e.parameter.paymentDueDate,
        timestamp: e.parameter.timestamp || new Date().toISOString()
      };
      return addMember(sheet, memberData);
    } else if (action === "extendMembership") {
      const extendData = {
        number: e.parameter.number,
        duration: e.parameter.duration,
        paymentDate: e.parameter.paymentDate || null // Optional payment date
      };
      return extendMembership(sheet, extendData);
    } else if (action === "checkNumber") {
      const number = e.parameter.number;
      return checkPhoneNumber(sheet, number);
    } else if (action === "getDashboardData") {
      const dateRange = e.parameter.dateRange || "all"; // "all", "monthly", or "custom"
      const startDate = e.parameter.startDate || null;
      const endDate = e.parameter.endDate || null;
      return getDashboardData(sheet, dateRange, startDate, endDate);
    } else if (action === "markPaymentPaid") {
      const paymentData = {
        number: e.parameter.number,
        paymentDate: e.parameter.paymentDate || new Date().toISOString().split('T')[0]
      };
      return markPaymentPaid(sheet, paymentData);
    } else if (action === "getExpiredMembers") {
      return getExpiredMembers(sheet);
    } else if (action === "addCustomer") {
      const customerData = {
        name: e.parameter.name,
        number: e.parameter.number,
        specialNotes: e.parameter.specialNotes || "",
        timestamp: e.parameter.timestamp || new Date().toISOString()
      };
      return addCustomer(sheet, customerData);
    } else if (action === "activateMember") {
      const activateData = {
        number: e.parameter.number,
        membershipType: e.parameter.membershipType,
        duration: e.parameter.duration,
        membershipFees: e.parameter.membershipFees,
        paymentType: e.parameter.paymentType,
        nextPayment: e.parameter.nextPayment || "",
        paymentDueDate: e.parameter.paymentDueDate || ""
      };
      return activateMember(sheet, activateData);
    } else if (action === "addDailyPass") {
      const dailyPassData = {
        number: e.parameter.number,
        timestamp: e.parameter.timestamp || new Date().toISOString()
      };
      return addDailyPass(sheet, dailyPassData);
    } else {
      // Default response for testing
      return createResponse(true, "Google Apps Script is running correctly");
    }
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return createResponse(false, "Error: " + error.toString());
  }
}

/**
 * Main function to handle POST requests (fallback)
 */
function doPost(e) {
  // Redirect to doGet for consistency
  return doGet(e);
}


/**
 * Check if phone number already exists
 */
function checkPhoneNumber(sheet, phoneNumber) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      return createResponse(false, "Number not found");
    }
    
    // Phone Number is in column 3 (index 3)
    const phoneColumn = 3;
    const dataRange = sheet.getRange(2, phoneColumn, lastRow - 1, 1);
    const phoneNumbers = dataRange.getValues();
    
    // Normalize phone number for comparison (remove spaces, dashes, etc.)
    const normalizedInput = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    for (let i = 0; i < phoneNumbers.length; i++) {
      const existingNumber = String(phoneNumbers[i][0]).replace(/[\s\-\(\)]/g, '');
      if (existingNumber === normalizedInput) {
        return createResponse(true, "Number exists");
      }
    }
    
    return createResponse(false, "Number not found");
  } catch (error) {
    Logger.log("Error checking number: " + error.toString());
    return createResponse(false, "Error checking number: " + error.toString());
  }
}

/**
 * Add a new member to the sheet
 */
function addMember(sheet, data) {
  try {
    // Check if headers exist, if not, create them
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      setupSheetHeaders(sheet);
    }
    
    // Check if phone number already exists
    const checkResult = checkPhoneNumber(sheet, data.number);
    const checkData = JSON.parse(checkResult.getContent());
    if (checkData.success && checkData.message === "Number exists") {
      return createResponse(false, "Membership with this number already exists");
    }
    
    // Calculate membership end date
    const startDate = new Date();
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();
    const startDay = startDate.getDate();
    
    // Calculate end date by adding months
    let endMonth = startMonth + parseInt(data.duration);
    let endYear = startYear;
    
    // Handle year overflow
    while (endMonth > 11) {
      endMonth -= 12;
      endYear += 1;
    }
    
    const endDate = new Date(endYear, endMonth, startDay);
    
    // Format dates consistently (MM/DD/YYYY)
    const formattedStartDate = (startMonth + 1) + "/" + startDay + "/" + startYear;
    const formattedEndDate = (endMonth + 1) + "/" + startDay + "/" + endYear;
    
    // Get membership fees from data, default to empty string if not provided
    let membershipFees = "";
    if (data.membershipFees) {
      const feesValue = parseFloat(data.membershipFees);
      if (!isNaN(feesValue) && feesValue >= 0) {
        membershipFees = feesValue;
      }
    }
    
    // Handle payment type and related fields
    const paymentType = data.paymentType || "Full";
    let nextPayment = "";
    let paymentDueDate = "";
    
    if (paymentType === "Partial") {
      // For partial payment, use provided values
      if (data.nextPayment) {
        const nextPaymentValue = parseFloat(data.nextPayment);
        if (!isNaN(nextPaymentValue) && nextPaymentValue >= 0) {
          nextPayment = nextPaymentValue;
        }
      }
      // Payment due date from form - convert from YYYY-MM-DD to MM/DD/YYYY
      if (data.paymentDueDate) {
        const dateParts = data.paymentDueDate.split('-');
        if (dateParts.length === 3) {
          paymentDueDate = dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0];
        } else {
          paymentDueDate = data.paymentDueDate; // Fallback if format is different
        }
      }
    } else {
      // For full payment, set next payment = membership fees and due date = end date
      nextPayment = membershipFees || "";
      paymentDueDate = formattedEndDate;
    }
    
    // Set Last Payment Date - for first time payment, it's the start date
    const lastPaymentDate = formattedStartDate;
    
    // Calculate Total Paid - if Full payment, it's the membership fees, otherwise 0
    const totalPaid = (paymentType === "Full" && membershipFees) ? membershipFees : 0;
    
    // Prepare row data
    const rowData = [
      new Date().toISOString(), // Timestamp
      data.name, // Name
      data.number, // Phone Number
      data.membershipType, // Membership Type
      data.duration + " Month(s)", // Duration
      formattedStartDate, // Start Date
      formattedEndDate, // End Date
      "Active", // Status
      membershipFees, // Membership Fees
      paymentType, // Payment Type
      nextPayment, // Next Payment
      paymentDueDate, // Payment Due Date
      lastPaymentDate, // Last Payment Date
      "", // Special Notes (empty for admin-added members)
      totalPaid // Total Paid
    ];
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Format the new row
    const newRow = sheet.getLastRow();
    formatRow(sheet, newRow);
    
    return createResponse(true, "Member added successfully");
  } catch (error) {
    Logger.log("Error adding member: " + error.toString());
    return createResponse(false, "Error adding member: " + error.toString());
  }
}

/**
 * Activate a pending member (update membership details)
 */
function activateMember(sheet, data) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      return createResponse(false, "No members found in the system");
    }
    
    // Phone Number is in column 3 (index 3)
    const phoneColumn = 3;
    const dataRange = sheet.getRange(2, phoneColumn, lastRow - 1, 1);
    const phoneNumbers = dataRange.getValues();
    
    // Normalize phone number for comparison
    const normalizedInput = data.number.replace(/[\s\-\(\)]/g, '');
    
    // Find the row with matching phone number
    let memberRow = -1;
    for (let i = 0; i < phoneNumbers.length; i++) {
      const existingNumber = String(phoneNumbers[i][0]).replace(/[\s\-\(\)]/g, '');
      if (existingNumber === normalizedInput) {
        memberRow = i + 2; // +2 because data starts at row 2 (row 1 is header)
        break;
      }
    }
    
    if (memberRow === -1) {
      return createResponse(false, "Member with this number not found");
    }
    
    // Check if duration is "Daily"
    const isDaily = data.duration === "Daily" || data.duration.toLowerCase() === "daily";
    
    // Calculate start and end dates (only if not Daily)
    let formattedStartDate = "";
    let formattedEndDate = "";
    let lastPaymentDate = "";
    
    if (!isDaily) {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      const durationMonths = parseInt(data.duration);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);
      
      // Format dates (MM/DD/YYYY)
      const startMonth = startDate.getMonth() + 1;
      const startDay = startDate.getDate();
      const startYear = startDate.getFullYear();
      formattedStartDate = startMonth + "/" + startDay + "/" + startYear;
      
      const endMonth = endDate.getMonth() + 1;
      const endDay = endDate.getDate();
      const endYear = endDate.getFullYear();
      formattedEndDate = endMonth + "/" + endDay + "/" + endYear;
      
      // Set Last Payment Date - for activation, it's the start date
      lastPaymentDate = formattedStartDate;
    }
    
    // Get membership fees
    const membershipFees = parseFloat(data.membershipFees) || 0;
    
    // Handle payment type and related fields
    const paymentType = data.paymentType || "Full";
    let nextPayment = "";
    let paymentDueDate = "";
    
    if (paymentType === "Partial") {
      // For partial payment, use provided values
      if (data.nextPayment) {
        const nextPaymentValue = parseFloat(data.nextPayment);
        if (!isNaN(nextPaymentValue) && nextPaymentValue >= 0) {
          nextPayment = nextPaymentValue;
        }
      }
      // Payment due date from form - convert from YYYY-MM-DD to MM/DD/YYYY
      if (data.paymentDueDate) {
        const dateParts = data.paymentDueDate.split('-');
        if (dateParts.length === 3) {
          paymentDueDate = dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0];
        } else {
          paymentDueDate = data.paymentDueDate;
        }
      }
    } else {
      // For full payment, set next payment = membership fees
      nextPayment = membershipFees;
      // Due date = end date (only if not Daily)
      paymentDueDate = formattedEndDate;
    }
    
    // Calculate Total Paid - if Full payment, it's the membership fees, otherwise 0
    const totalPaid = (paymentType === "Full" && membershipFees) ? membershipFees : 0;
    
    // Update the row
    sheet.getRange(memberRow, 4).setValue(data.membershipType); // Membership Type
    // Duration: "Daily" or "X Month(s)"
    const durationDisplay = isDaily ? "Daily" : (data.duration + " Month(s)");
    sheet.getRange(memberRow, 5).setValue(durationDisplay); // Duration
    sheet.getRange(memberRow, 6).setValue(formattedStartDate); // Start Date (empty for Daily)
    sheet.getRange(memberRow, 7).setValue(formattedEndDate); // End Date (empty for Daily)
    sheet.getRange(memberRow, 8).setValue("Active"); // Status
    sheet.getRange(memberRow, 9).setValue(membershipFees); // Membership Fees
    sheet.getRange(memberRow, 10).setValue(paymentType); // Payment Type
    sheet.getRange(memberRow, 11).setValue(nextPayment); // Next Payment
    sheet.getRange(memberRow, 12).setValue(paymentDueDate); // Payment Due Date (empty for Daily)
    sheet.getRange(memberRow, 13).setValue(lastPaymentDate); // Last Payment Date (empty for Daily)
    sheet.getRange(memberRow, 15).setValue(totalPaid); // Total Paid
    
    // Format the updated row
    formatRow(sheet, memberRow);
    
    return createResponse(true, "Member activated successfully");
  } catch (error) {
    Logger.log("Error activating member: " + error.toString());
    return createResponse(false, "Error activating member: " + error.toString());
  }
}

/**
 * Add customer information (simplified form for customers)
 */
function addCustomer(sheet, data) {
  try {
    const lastRow = sheet.getLastRow();
    
    // Check if headers need to be updated (if Special Notes column doesn't exist)
    if (lastRow === 0) {
      setupSheetHeaders(sheet);
    } else {
      // Check if Special Notes and Total Paid columns exist
      const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (headerRow.length < 14 || headerRow[13] !== "Special Notes") {
        // Add Special Notes header if it doesn't exist
        sheet.getRange(1, 14).setValue("Special Notes");
      }
      if (headerRow.length < 15 || headerRow[14] !== "Total Paid") {
        // Add Total Paid header if it doesn't exist
        sheet.getRange(1, 15).setValue("Total Paid");
        // Format Total Paid column
        const totalPaidColumn = sheet.getRange(2, 15, sheet.getMaxRows() - 1, 1);
        totalPaidColumn.setNumberFormat("#,##0");
      }
      
      // Check if phone number already exists
      const checkResult = checkPhoneNumber(sheet, data.number);
      const checkData = JSON.parse(checkResult.getContent());
      if (checkData.success && checkData.message === "Number exists") {
        return createResponse(false, "This phone number is already registered. Please use a different number or contact us if you need assistance.");
      }
    }
    
    // Prepare row data - leave admin fields empty/default
    const rowData = [
      new Date().toISOString(), // Timestamp
      data.name, // Name
      data.number, // Phone Number
      "", // Membership Type (to be filled by admin)
      "", // Duration (to be filled by admin)
      "", // Start Date (to be filled by admin)
      "", // End Date (to be filled by admin)
      "Pending", // Status (new customer, pending)
      "", // Membership Fees (to be filled by admin)
      "", // Payment Type (to be filled by admin)
      "", // Next Payment (to be filled by admin)
      "", // Payment Due Date (to be filled by admin)
      "", // Last Payment Date (to be filled by admin)
      data.specialNotes || "", // Special Notes
      0 // Total Paid (starts at 0)
    ];
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Format the new row
    const newRow = sheet.getLastRow();
    formatRow(sheet, newRow);
    
    return createResponse(true, "Customer information submitted successfully");
  } catch (error) {
    Logger.log("Error adding customer: " + error.toString());
    return createResponse(false, "Error adding customer: " + error.toString());
  }
}

/**
 * Add Daily Pass for an existing member (adds 70 rs to membership fees and total paid)
 */
function addDailyPass(sheet, data) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      return createResponse(false, "No members found in the system");
    }
    
    // Phone Number is in column 3 (index 3)
    const phoneColumn = 3;
    const dataRange = sheet.getRange(2, phoneColumn, lastRow - 1, 1);
    const phoneNumbers = dataRange.getValues();
    
    // Normalize phone number for comparison
    const normalizedInput = data.number.replace(/[\s\-\(\)]/g, '');
    
    // Find the row with matching phone number
    let memberRow = -1;
    for (let i = 0; i < phoneNumbers.length; i++) {
      const existingNumber = String(phoneNumbers[i][0]).replace(/[\s\-\(\)]/g, '');
      if (existingNumber === normalizedInput) {
        memberRow = i + 2; // +2 because data starts at row 2 (row 1 is header)
        break;
      }
    }
    
    if (memberRow === -1) {
      return createResponse(false, "Member with this number not found");
    }
    
    // Get current Membership Fees (column 9)
    const currentFeesValue = sheet.getRange(memberRow, 9).getValue();
    const currentFees = parseFloat(currentFeesValue) || 0;
    
    // Get current Total Paid (column 15)
    const currentTotalPaidValue = sheet.getRange(memberRow, 15).getValue();
    const currentTotalPaid = parseFloat(currentTotalPaidValue) || 0;
    
    // Add 70 rs to both Membership Fees and Total Paid
    const newFees = currentFees + 70;
    const newTotalPaid = currentTotalPaid + 70;
    
    // Update the row
    sheet.getRange(memberRow, 9).setValue(newFees); // Membership Fees
    sheet.getRange(memberRow, 15).setValue(newTotalPaid); // Total Paid
    
    // Format the updated row
    formatRow(sheet, memberRow);
    
    return createResponse(true, "Daily pass added successfully. ₹70 added to membership fees.");
  } catch (error) {
    Logger.log("Error adding daily pass: " + error.toString());
    return createResponse(false, "Error adding daily pass: " + error.toString());
  }
}

/**
 * Extend membership for an existing member
 */
function extendMembership(sheet, data) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      return createResponse(false, "No members found in the system");
    }
    
    // Phone Number is in column 3 (index 3)
    const phoneColumn = 3;
    const dataRange = sheet.getRange(2, phoneColumn, lastRow - 1, 1);
    const phoneNumbers = dataRange.getValues();
    
    // Normalize phone number for comparison
    const normalizedInput = data.number.replace(/[\s\-\(\)]/g, '');
    
    // Find the row with matching phone number
    let memberRow = -1;
    for (let i = 0; i < phoneNumbers.length; i++) {
      const existingNumber = String(phoneNumbers[i][0]).replace(/[\s\-\(\)]/g, '');
      if (existingNumber === normalizedInput) {
        memberRow = i + 2; // +2 because data starts at row 2 (row 1 is header)
        break;
      }
    }
    
    if (memberRow === -1) {
      return createResponse(false, "Member with this number not found");
    }
    
    // Get current membership data
    const currentDuration = sheet.getRange(memberRow, 5).getValue(); // Duration column
    const currentEndDateValue = sheet.getRange(memberRow, 7).getValue(); // End Date column
    const currentStartDateValue = sheet.getRange(memberRow, 6).getValue(); // Start Date column
    
    // Parse current duration (remove "Month(s)" text)
    const currentDurationMonths = parseInt(String(currentDuration).replace(/\D/g, '')) || 0;
    const newDurationMonths = currentDurationMonths + parseInt(data.duration);
    
    // Helper function to parse date from sheet
    // Google Sheets returns dates as Date objects, not strings
    function parseSheetDate(dateValue) {
      if (!dateValue) return null;
      
      // If it's already a Date object (Google Sheets often returns this)
      if (dateValue instanceof Date) {
        return new Date(dateValue);
      }
      
      // If it's a number (serial date number from Excel/Sheets)
      if (typeof dateValue === 'number') {
        // Google Sheets uses days since December 30, 1899
        const baseDate = new Date(1899, 11, 30); // December 30, 1899
        const date = new Date(baseDate.getTime() + dateValue * 24 * 60 * 60 * 1000);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // Try as string (MM/DD/YYYY format)
      const dateString = String(dateValue).trim();
      const dateMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateMatch) {
        const month = parseInt(dateMatch[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);
        const parsed = new Date(year, month, day);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
      
      // Try as Date object constructor
      const dateObj = new Date(dateValue);
      if (!isNaN(dateObj.getTime())) {
        return dateObj;
      }
      
      return null;
    }
    
    // Parse current end date and extend from there
    let newEndDate;
    const parsedEndDate = parseSheetDate(currentEndDateValue);
    
    if (parsedEndDate) {
      // Extend from the current end date
      newEndDate = new Date(parsedEndDate);
      // Add months to the end date
      const currentMonth = newEndDate.getMonth();
      const currentYear = newEndDate.getFullYear();
      const currentDay = newEndDate.getDate();
      
      // Calculate new month and year
      let newMonth = currentMonth + parseInt(data.duration);
      let newYear = currentYear;
      
      // Handle year overflow
      while (newMonth > 11) {
        newMonth -= 12;
        newYear += 1;
      }
      
      newEndDate = new Date(newYear, newMonth, currentDay);
    } else {
      // If end date parsing fails, calculate from start date + new total duration
      const parsedStartDate = parseSheetDate(currentStartDateValue);
      if (parsedStartDate) {
        newEndDate = new Date(parsedStartDate);
        const startMonth = newEndDate.getMonth();
        const startYear = newEndDate.getFullYear();
        const startDay = newEndDate.getDate();
        
        // Calculate new month and year
        let newMonth = startMonth + newDurationMonths;
        let newYear = startYear;
        
        // Handle year overflow
        while (newMonth > 11) {
          newMonth -= 12;
          newYear += 1;
        }
        
        newEndDate = new Date(newYear, newMonth, startDay);
      } else {
        // Last resort: use current date + new duration
        newEndDate = new Date();
        const currentMonth = newEndDate.getMonth();
        const currentYear = newEndDate.getFullYear();
        const currentDay = newEndDate.getDate();
        
        let newMonth = currentMonth + newDurationMonths;
        let newYear = currentYear;
        
        while (newMonth > 11) {
          newMonth -= 12;
          newYear += 1;
        }
        
        newEndDate = new Date(newYear, newMonth, currentDay);
      }
    }
    
    // Format the date consistently (MM/DD/YYYY)
    const month = newEndDate.getMonth() + 1;
    const day = newEndDate.getDate();
    const year = newEndDate.getFullYear();
    const formattedEndDate = month + "/" + day + "/" + year;
    
    // Handle payment date - update Last Payment Date if provided
    let formattedPaymentDate = null;
    if (data.paymentDate) {
      // Parse payment date (can be "today" or YYYY-MM-DD format)
      let paymentDate;
      if (data.paymentDate.toLowerCase() === "today") {
        paymentDate = new Date();
      } else {
        // Parse YYYY-MM-DD format
        const dateParts = data.paymentDate.split('-');
        if (dateParts.length === 3) {
          paymentDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        } else {
          paymentDate = new Date(data.paymentDate);
        }
      }
      
      if (!isNaN(paymentDate.getTime())) {
        const payMonth = paymentDate.getMonth() + 1;
        const payDay = paymentDate.getDate();
        const payYear = paymentDate.getFullYear();
        formattedPaymentDate = payMonth + "/" + payDay + "/" + payYear;
      }
    }
    
    // Update the row
    sheet.getRange(memberRow, 5).setValue(newDurationMonths + " Month(s)"); // Update Duration
    sheet.getRange(memberRow, 7).setValue(formattedEndDate); // Update End Date
    
    // Update Last Payment Date if payment date provided
    if (formattedPaymentDate) {
      sheet.getRange(memberRow, 13).setValue(formattedPaymentDate); // Update Last Payment Date (column 13)
    }
    
    // Update Next Payment Date to be the end date
    sheet.getRange(memberRow, 11).setValue(formattedEndDate); // Update Payment Due Date (column 11)
    
    return createResponse(true, "Membership extended successfully");
  } catch (error) {
    Logger.log("Error extending membership: " + error.toString());
    return createResponse(false, "Error extending membership: " + error.toString());
  }
}

/**
 * Set up sheet headers
 */
function setupSheetHeaders(sheet) {
  const headers = [
    "Timestamp",
    "Name",
    "Phone Number",
    "Membership Type",
    "Duration",
    "Start Date",
    "End Date",
    "Status",
    "Membership Fees",
    "Payment Type",
    "Next Payment",
    "Payment Due Date",
    "Last Payment Date",
    "Special Notes",
    "Total Paid"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285f4");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Set Membership Fees column to number format
  const feesColumn = sheet.getRange(2, 9, sheet.getMaxRows() - 1, 1);
  feesColumn.setNumberFormat("#,##0");
  
  // Set Next Payment column to number format
  const nextPaymentColumn = sheet.getRange(2, 11, sheet.getMaxRows() - 1, 1);
  nextPaymentColumn.setNumberFormat("#,##0");
  
  // Set Total Paid column to number format
  const totalPaidColumn = sheet.getRange(2, 15, sheet.getMaxRows() - 1, 1);
  totalPaidColumn.setNumberFormat("#,##0");
}

/**
 * Format a data row
 */
function formatRow(sheet, row) {
  const range = sheet.getRange(row, 1, 1, 15);
  range.setHorizontalAlignment("left");
  range.setVerticalAlignment("middle");
  range.setWrap(true);
  
  // Format Membership Fees column as number
  const feesCell = sheet.getRange(row, 9);
  feesCell.setNumberFormat("#,##0");
  
  // Format Next Payment column as number
  const nextPaymentCell = sheet.getRange(row, 11);
  nextPaymentCell.setNumberFormat("#,##0");
  
  // Format Total Paid column as number
  const totalPaidCell = sheet.getRange(row, 15);
  totalPaidCell.setNumberFormat("#,##0");
  
  // Alternate row colors for better readability
  if (row % 2 === 0) {
    range.setBackground("#f8f9fa");
  } else {
    range.setBackground("#ffffff");
  }
}

/**
 * Get dashboard data (stats, expiring members, occupancy)
 */
function getDashboardData(sheet, dateRange, startDate, endDate) {
  try {
    const lastRow = sheet.getLastRow();
    
    if (lastRow === 0 || lastRow === 1) {
      // No data or only headers
      return createDataResponse({
        stats: {
          activeMembers: 0,
          activationPending: 0,
          expiringSoon: 0,
          totalMembershipCost: 0
        },
        expiringMembers: [],
        pendingActivations: {
          count: 0,
          list: []
        },
        payments: {
          count: 0,
          totalAmount: 0,
          list: []
        }
      });
    }
    
    // Get all member data (skip header row) - now 14 columns including Last Payment Date and Special Notes
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 14);
    const allData = dataRange.getValues();
    
    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse date range filters
    let filterStartDate = null;
    let filterEndDate = null;
    
    if (dateRange === "monthly") {
      // Current month
      filterStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
      filterEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (dateRange === "custom" && startDate && endDate) {
      // Custom date range
      filterStartDate = parseSheetDate(startDate);
      filterEndDate = parseSheetDate(endDate);
      if (filterEndDate) {
        filterEndDate.setHours(23, 59, 59, 999); // End of day
      }
    }
    // "all" or default: no date filtering
    
    let activeMembers = 0;
    let expiringSoon = 0;
    let totalMembershipCost = 0;
    let activationPending = 0;
    let paymentsDue = 0;
    let totalPendingAmount = 0;
    const expiringMembersList = [];
    const pendingActivationsList = [];
    const pendingPaymentsList = [];
    
    // Parse dates and check status
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      const status = row[7]; // Status column
      const endDateStr = row[6]; // End Date column
      const name = row[1]; // Name column
      const phone = row[2]; // Phone column
      const membershipFees = row[8]; // Membership Fees column
      const paymentType = row[9]; // Payment Type column (index 9)
      const lastPaymentDateStr = row[12]; // Last Payment Date column (new column 13, index 12)
      const specialNotes = row[13] || ""; // Special Notes column (index 13)
      
      // Check for pending activations (members with empty Payment Type)
      const paymentTypeStr = String(paymentType || "").trim();
      if (!paymentTypeStr || paymentTypeStr === "") {
        activationPending++;
        pendingActivationsList.push({
          name: name || "Unknown",
          phone: phone || "",
          specialNotes: specialNotes || ""
        });
      }
      
      // Check if member is active (must have payment type filled)
      if (status === "Active" && paymentTypeStr && paymentTypeStr !== "") {
        activeMembers++;
        
        // Add membership fees to total based on date range filter
        if (membershipFees) {
          const feesValue = parseFloat(String(membershipFees).replace(/[^\d.-]/g, ''));
          if (!isNaN(feesValue) && feesValue > 0) {
            // Apply date range filter for subscription cost
            let shouldInclude = true;
            if (dateRange !== "all" && filterStartDate && filterEndDate) {
              // Check if last payment date falls within the range
              if (lastPaymentDateStr) {
                const lastPaymentDate = parseSheetDate(lastPaymentDateStr);
                if (lastPaymentDate) {
                  shouldInclude = (lastPaymentDate >= filterStartDate && lastPaymentDate <= filterEndDate);
                } else {
                  // If no last payment date, use start date
                  const startDateParsed = parseSheetDate(row[5]); // Start Date column
                  if (startDateParsed) {
                    shouldInclude = (startDateParsed >= filterStartDate && startDateParsed <= filterEndDate);
                  } else {
                    shouldInclude = false;
                  }
                }
              } else {
                // If no last payment date, use start date
                const startDateParsed = parseSheetDate(row[5]); // Start Date column
                if (startDateParsed) {
                  shouldInclude = (startDateParsed >= filterStartDate && startDateParsed <= filterEndDate);
                } else {
                  shouldInclude = false;
                }
              }
            }
            
            if (shouldInclude) {
              totalMembershipCost += feesValue;
            }
          }
        }
        
        // Check if expiring soon (within 10 days) and payment due date
        let isExpiringSoon = false;
        let daysUntilExpiry = 0;
        let endDateObj = null;
        if (endDateStr) {
          endDateObj = parseSheetDate(endDateStr);
          if (endDateObj) {
            daysUntilExpiry = Math.ceil((endDateObj - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry > 0 && daysUntilExpiry <= 10) {
              isExpiringSoon = true;
              expiringSoon++;
              expiringMembersList.push({
                name: name || "Unknown",
                daysLeft: daysUntilExpiry,
                phone: phone || "",
                email: "" // Email not stored in current sheet structure - can be added later
              });
            }
          }
        }
        
        // Check for payments due (payment due date is within next 10 days, including today)
        // Only add to payments due if:
        // 1. NOT expiring soon (prioritize membership expiration)
        // 2. Payment due date does NOT equal membership end date (same date means it's about membership expiration)
        const paymentDueDateStr = row[11]; // Payment Due Date column
        const nextPayment = row[10]; // Next Payment column (Due amount)
        
        // Check if payment due date equals membership end date
        let isPaymentDateSameAsEndDate = false;
        if (paymentDueDateStr && endDateObj) {
          const paymentDueDate = parseSheetDate(paymentDueDateStr);
          if (paymentDueDate && endDateObj) {
            // Compare dates (ignore time, just compare year/month/day)
            const endDateOnly = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), endDateObj.getDate());
            const paymentDateOnly = new Date(paymentDueDate.getFullYear(), paymentDueDate.getMonth(), paymentDueDate.getDate());
            isPaymentDateSameAsEndDate = (endDateOnly.getTime() === paymentDateOnly.getTime());
          }
        }
        
        // Only check for payments due if not expiring soon AND payment date is not the same as end date
        if (paymentDueDateStr && !isExpiringSoon && !isPaymentDateSameAsEndDate) {
          const paymentDueDate = parseSheetDate(paymentDueDateStr);
          if (paymentDueDate) {
            const daysUntilPayment = Math.ceil((paymentDueDate - today) / (1000 * 60 * 60 * 24));
            if (daysUntilPayment >= 0 && daysUntilPayment <= 10) {
              paymentsDue++;
              let paymentValue = 0;
              // Add next payment amount to total pending
              if (nextPayment) {
                paymentValue = parseFloat(String(nextPayment).replace(/[^\d.-]/g, ''));
                if (!isNaN(paymentValue) && paymentValue > 0) {
                  totalPendingAmount += paymentValue;
                }
              }
              // Add to pending payments list
              pendingPaymentsList.push({
                name: name || "Unknown",
                phone: phone || "",
                amount: paymentValue,
                daysUntilPayment: daysUntilPayment,
                paymentDueDate: paymentDueDateStr
              });
            }
          }
        }
      }
    }
    
    // Sort expiring members by days left (ascending)
    expiringMembersList.sort((a, b) => a.daysLeft - b.daysLeft);
    
    // Get top 10 expiring members (matching the 10-day threshold)
    const topExpiring = expiringMembersList.slice(0, 10);
    
    // Sort pending payments by days until payment (ascending - most urgent first)
    pendingPaymentsList.sort((a, b) => a.daysUntilPayment - b.daysUntilPayment);
    
    return createDataResponse({
      stats: {
        activeMembers: activeMembers,
        activationPending: activationPending,
        expiringSoon: expiringSoon,
        totalMembershipCost: totalMembershipCost
      },
      expiringMembers: topExpiring,
      pendingActivations: {
        count: activationPending,
        list: pendingActivationsList
      },
      payments: {
        count: paymentsDue,
        totalAmount: totalPendingAmount,
        list: pendingPaymentsList
      }
    });
  } catch (error) {
    Logger.log("Error getting dashboard data: " + error.toString());
    return createResponse(false, "Error getting dashboard data: " + error.toString());
  }
}

/**
 * Get expired members list
 */
function getExpiredMembers(sheet) {
  try {
    const lastRow = sheet.getLastRow();
    
    if (lastRow === 0 || lastRow === 1) {
      // No data or only headers
      return createDataResponse([]);
    }
    
    // Get all member data (skip header row) - 14 columns including Special Notes
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 14);
    const allData = dataRange.getValues();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiredMembersList = [];
    
    // Check each member
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      const status = row[7]; // Status column
      const endDateStr = row[6]; // End Date column
      const name = row[1]; // Name column
      const phone = row[2]; // Phone column
      const membershipType = row[3]; // Membership Type column
      const duration = row[4]; // Duration column
      const startDateStr = row[5]; // Start Date column
      
      // Check if membership has expired (end date is in the past)
      if (endDateStr) {
        const endDate = parseSheetDate(endDateStr);
        if (endDate) {
          endDate.setHours(0, 0, 0, 0);
          const daysExpired = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
          
          // If end date is in the past
          if (daysExpired >= 0) {
            expiredMembersList.push({
              name: name || "Unknown",
              phone: phone || "",
              email: "", // Email not stored in current sheet structure
              membershipType: membershipType || "",
              duration: duration || "",
              startDate: startDateStr || "",
              endDate: endDateStr || "",
              daysExpired: daysExpired,
              status: status || "Expired"
            });
          }
        }
      }
    }
    
    // Sort expired members by days expired (most recently expired first)
    expiredMembersList.sort((a, b) => a.daysExpired - b.daysExpired);
    
    return createDataResponse(expiredMembersList);
  } catch (error) {
    Logger.log("Error getting expired members: " + error.toString());
    return createResponse(false, "Error getting expired members: " + error.toString());
  }
}

/**
 * Helper function to parse date from sheet (reused from extendMembership)
 */
function parseSheetDate(dateValue) {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return new Date(dateValue);
  }
  
  // If it's a number (serial date)
  if (typeof dateValue === 'number') {
    const baseDate = new Date(1899, 11, 30);
    const date = new Date(baseDate.getTime() + dateValue * 24 * 60 * 60 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Try as string (MM/DD/YYYY format)
  const dateString = String(dateValue).trim();
  const dateMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]) - 1;
    const day = parseInt(dateMatch[2]);
    const year = parseInt(dateMatch[3]);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  // Try as Date object constructor
  const dateObj = new Date(dateValue);
  if (!isNaN(dateObj.getTime())) {
    return dateObj;
  }
  
  return null;
}

/**
 * Mark payment as paid - update Last Payment Date
 */
function markPaymentPaid(sheet, data) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      return createResponse(false, "No members found in the system");
    }
    
    // Phone Number is in column 3 (index 3)
    const phoneColumn = 3;
    const dataRange = sheet.getRange(2, phoneColumn, lastRow - 1, 1);
    const phoneNumbers = dataRange.getValues();
    
    // Normalize phone number for comparison
    const normalizedInput = data.number.replace(/[\s\-\(\)]/g, '');
    
    // Find the row with matching phone number
    let memberRow = -1;
    for (let i = 0; i < phoneNumbers.length; i++) {
      const existingNumber = String(phoneNumbers[i][0]).replace(/[\s\-\(\)]/g, '');
      if (existingNumber === normalizedInput) {
        memberRow = i + 2; // +2 because data starts at row 2 (row 1 is header)
        break;
      }
    }
    
    if (memberRow === -1) {
      return createResponse(false, "Member with this number not found");
    }
    
    // Parse payment date
    let paymentDate;
    if (data.paymentDate) {
      // Parse YYYY-MM-DD format
      const dateParts = data.paymentDate.split('-');
      if (dateParts.length === 3) {
        paymentDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      } else {
        paymentDate = new Date(data.paymentDate);
      }
    } else {
      paymentDate = new Date(); // Use today if not provided
    }
    
    if (isNaN(paymentDate.getTime())) {
      return createResponse(false, "Invalid payment date");
    }
    
    // Format the date consistently (MM/DD/YYYY)
    const month = paymentDate.getMonth() + 1;
    const day = paymentDate.getDate();
    const year = paymentDate.getFullYear();
    const formattedPaymentDate = month + "/" + day + "/" + year;
    
    // Get end date (column 7) to set as next payment date (column 12)
    const endDateValue = sheet.getRange(memberRow, 7).getValue(); // End Date column
    let formattedEndDate = endDateValue;
    
    // Parse and format end date
    const parsedEndDate = parseSheetDate(endDateValue);
    if (parsedEndDate) {
      const month = parsedEndDate.getMonth() + 1;
      const day = parsedEndDate.getDate();
      const year = parsedEndDate.getFullYear();
      formattedEndDate = month + "/" + day + "/" + year;
    }
    
    // Get the payment amount BEFORE updating (Next Payment column 11)
    const nextPaymentBeforeUpdate = sheet.getRange(memberRow, 11).getValue();
    let paymentAmount = 0;
    if (nextPaymentBeforeUpdate) {
      paymentAmount = parseFloat(String(nextPaymentBeforeUpdate).replace(/[^\d.-]/g, ''));
      if (isNaN(paymentAmount)) {
        paymentAmount = 0;
      }
    }
    
    // Get membership fees (column 9) to set as due amount (column 11)
    const membershipFees = sheet.getRange(memberRow, 9).getValue(); // Membership Fees column
    
    // If Next Payment is empty or 0, use membership fees as payment amount
    if (paymentAmount === 0 && membershipFees) {
      paymentAmount = parseFloat(String(membershipFees).replace(/[^\d.-]/g, ''));
      if (isNaN(paymentAmount)) {
        paymentAmount = 0;
      }
    }
    let feesValue = 0;
    if (membershipFees) {
      feesValue = parseFloat(String(membershipFees).replace(/[^\d.-]/g, ''));
      if (isNaN(feesValue)) {
        feesValue = 0;
      }
    }
    
    // Update Payment Type to "Full" (column 10)
    sheet.getRange(memberRow, 10).setValue("Full");
    
    // Update Due amount (column 11) to Membership Fees (numeric value, not date)
    sheet.getRange(memberRow, 11).setValue(feesValue);
    
    // Format the cell as number to ensure it's treated as numeric
    sheet.getRange(memberRow, 11).setNumberFormat("#,##0");
    
    // Update Next Payment / Payment Due Date (column 12) to End Date
    sheet.getRange(memberRow, 12).setValue(formattedEndDate);
    
    // Update Last Payment Date (column 13) with the payment date
    sheet.getRange(memberRow, 13).setValue(formattedPaymentDate);
    
    // Update Total Paid (column 15) - add the payment amount
    const currentTotalPaidValue = sheet.getRange(memberRow, 15).getValue();
    const currentTotalPaid = parseFloat(currentTotalPaidValue) || 0;
    
    // Add payment amount to Total Paid
    const newTotalPaid = currentTotalPaid + paymentAmount;
    sheet.getRange(memberRow, 15).setValue(newTotalPaid);
    sheet.getRange(memberRow, 15).setNumberFormat("#,##0");
    
    return createResponse(true, "Payment marked as paid successfully");
  } catch (error) {
    Logger.log("Error marking payment as paid: " + error.toString());
    return createResponse(false, "Error marking payment as paid: " + error.toString());
  }
}

/**
 * Create a JSON response with data
 */
function createDataResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create a JSON response
 */
function createResponse(success, message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - Run this to test the script
 */
function testAddMember() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    setupSheetHeaders(sheet);
  }
  
  const testData = {
    name: "Test Member",
    number: "+91 98765 43210",
    membershipType: "Premium",
    duration: "3"
  };
  
  const result = addMember(sheet, testData);
  Logger.log(result.getContent());
}

