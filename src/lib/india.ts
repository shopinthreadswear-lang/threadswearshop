export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const PREFIX: [RegExp, string][] = [
  [/^11/, "Delhi"], [/^1[23]/, "Haryana"], [/^1[456]/, "Punjab"], [/^17/, "Himachal Pradesh"], [/^1[89]/, "Jammu and Kashmir"],
  [/^24[6-9]|^26[23]/, "Uttarakhand"], [/^2[0-8]/, "Uttar Pradesh"], [/^3[0-4]/, "Rajasthan"], [/^3[6-9]/, "Gujarat"], [/^403/, "Goa"],
  [/^4[0-4]/, "Maharashtra"], [/^4[5-8]/, "Madhya Pradesh"], [/^49/, "Chhattisgarh"], [/^50/, "Telangana"], [/^5[1-3]/, "Andhra Pradesh"],
  [/^5[6-9]/, "Karnataka"], [/^605/, "Puducherry"], [/^6[0-4]/, "Tamil Nadu"], [/^6[7-9]/, "Kerala"], [/^7[0-4]/, "West Bengal"],
  [/^7[5-7]/, "Odisha"], [/^78/, "Assam"], [/^8[0-5]/, "Bihar"], [/^8[0-3]/, "Jharkhand"],
];
const CITY: [RegExp, string][] = [[/^400/, "Mumbai"], [/^11/, "New Delhi"], [/^560/, "Bengaluru"], [/^600/, "Chennai"], [/^500/, "Hyderabad"], [/^700/, "Kolkata"], [/^411/, "Pune"], [/^380/, "Ahmedabad"], [/^122/, "Gurugram"], [/^201/, "Noida"], [/^302/, "Jaipur"], [/^682/, "Kochi"], [/^160/, "Chandigarh"], [/^226/, "Lucknow"]];

export function lookupPincode(pin: string) {
  if (!/^[1-9]\d{5}$/.test(pin)) return null;
  return { state: PREFIX.find(([r]) => r.test(pin))?.[1], city: CITY.find(([r]) => r.test(pin))?.[1] };
}
