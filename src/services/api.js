import { GOOGLE_SCRIPT_URL } from "../constants/api";

/**
 * Fetch expired members from Google Sheets
 */
export async function fetchExpiredMembers() {
  try {
    const params = new URLSearchParams({
      action: "getExpiredMembers",
    });

    const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
      method: "GET",
      redirect: "follow",
    });

    if (response.ok) {
      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch (e) {
        // Try to extract JSON from HTML if embedded
        const jsonMatch = text.match(/\{.*"success".*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse response");
        }
      }

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to fetch expired members");
      }
    } else {
      throw new Error("Failed to connect to server");
    }
  } catch (error) {
    console.error("Error fetching expired members:", error);
    // Return empty array on error
    return [];
  }
}

/**
 * Fetch dashboard data from Google Sheets
 */
export async function fetchDashboardData(dateRange = "all", startDate = null, endDate = null) {
  try {
    const params = new URLSearchParams({
      action: "getDashboardData",
      dateRange: dateRange,
    });
    
    if (dateRange === "custom" && startDate && endDate) {
      params.append("startDate", startDate);
      params.append("endDate", endDate);
    }

    const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
      method: "GET",
      redirect: "follow",
    });

    if (response.ok) {
      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch (e) {
        // Try to extract JSON from HTML if embedded
        const jsonMatch = text.match(/\{.*"success".*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse response");
        }
      }

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }
    } else {
      throw new Error("Failed to connect to server");
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return default/fallback data on error
    return {
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
    };
  }
}

