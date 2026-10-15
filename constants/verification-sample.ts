import { portrait } from "@/constants/sample-portraits";
import type { CompactKpi } from "@/types/kpi";
import type {
  ApprovalDistribution,
  FraudSignal,
  TopModerator,
  TrendPoint,
  VerificationCase,
} from "@/types/verification";

// UI only: the figures from the verification Figma, so the page renders
// before the verification endpoints are typed and wired. Replace with API data.

export const SAMPLE_VERIFICATION_KPIS: CompactKpi[] = [
  {
    id: "pending",
    label: "Pending Reviews",
    value: "142",
    change: {
      label: "12%",
      direction: "up",
      favorable: false,
      comparison: "vs last month",
    },
    trend: [
      12, 13, 15, 18, 16, 19, 19, 22, 25, 23, 25, 23, 27, 27, 30, 29, 32, 32, 35, 36, 40, 39, 47,
    ],
  },
  {
    id: "approved",
    label: "Approved Today",
    value: "856",
    change: {
      label: "5.4%",
      direction: "up",
      favorable: true,
      comparison: "vs yesterday",
    },
    trend: [9, 11, 10, 18, 7, 14, 13, 21, 13, 27],
  },
  {
    id: "rejected",
    label: "Rejected Today",
    value: "24",
    // The Figma draws this one red, though fewer rejections reads as good news.
    change: {
      label: "2.1%",
      direction: "down",
      favorable: false,
      comparison: "vs last month",
    },
    trend: [3, 7, 7, 17, 17, 25, 23, 17, 19, 35, 38, 33, 47, 47, 41, 52, 60, 63],
  },
  {
    id: "review-time",
    label: "Avg Review Time",
    value: "4.2m",
    change: {
      label: "-15s",
      direction: "down",
      favorable: true,
      comparison: "vs last month",
    },
    trend: [13, 12, 18, 17, 23, 19, 22, 21, 25, 24, 38, 35, 38, 35, 44, 48, 42, 50, 48, 61],
  },
  {
    id: "success-rate",
    label: "Success Rate",
    value: "98.2%",
    change: {
      label: "0.8%",
      direction: "up",
      favorable: true,
      comparison: "vs last month",
    },
    trend: [17, 15, 22, 20, 26, 23, 28, 26, 32, 44, 40, 43, 40, 50, 54, 48, 55, 59, 66],
  },
  {
    id: "fraud",
    label: "Fraud Detected",
    value: "12",
    change: {
      label: "+3",
      direction: "up",
      favorable: false,
      comparison: "vs last month",
    },
    trend: [15, 13, 19, 17, 22, 19, 23, 21, 28, 29, 37, 34, 40, 35, 43, 47, 40, 49, 47, 58, 63],
  },
];

const SAMPLE_IMAGES = "/images/sample";

export const SAMPLE_VERIFICATION_QUEUE: VerificationCase[] = [
  {
    userId: "sample-emma-thompson",
    caseId: "XP-8829",
    name: "Emma Thompson",
    avatarUrl: portrait("women/44"),
    documentType: "Passport (United Kingdom)",
    country: "GBR",
    faceMatch: 98,
    risk: "low",
    status: "PENDING",
    reviewer: null,
    submitted: "2h ago",
    documents: [
      { id: "front", label: "Passport (Front)", url: `${SAMPLE_IMAGES}/verification-passport.jpg` },
      { id: "selfie", label: "Selfie / Liveness", url: `${SAMPLE_IMAGES}/verification-selfie.jpg` },
    ],
    liveness: 99,
    authenticity: 85,
    summary:
      "AI suggests high confidence in this identity. All facial landmarks match the document provided.",
    ocr: [
      { id: "full-name", label: "Full Name", value: "Emma Thompson" },
      { id: "date-of-birth", label: "Date of Birth", value: "12 May 1994" },
      { id: "id-number", label: "ID Number", value: "GB988220192L" },
      { id: "expiry-date", label: "Expiry Date", value: "12 Aug 2028", flagged: true },
      { id: "nationality", label: "Nationality", value: "British" },
      { id: "gender", label: "Gender", value: "Female" },
    ],
    history: [
      { id: "1", title: "Submission Received", time: "Today at 09:12 AM", actor: "user" },
      {
        id: "2",
        title: "Case Assigned to Review Queue",
        time: "Today at 09:15 AM",
        actor: "system",
      },
    ],
    documentIssues: { "id-front": "Image quality was too low or obscured." },
  },
  {
    userId: "sample-carlos-mendoza",
    caseId: "XP-9012",
    name: "Carlos Mendoza",
    avatarUrl: portrait("men/46"),
    documentType: "Driver License (Spain)",
    country: "ESP",
    faceMatch: 82,
    risk: "medium",
    status: "UNDER_REVIEW",
    reviewer: "Alex Chen",
    submitted: "5h ago",
    documents: [
      {
        id: "front",
        label: "Driver License (Front)",
        url: `${SAMPLE_IMAGES}/verification-document.jpg`,
      },
      { id: "selfie", label: "Selfie / Liveness", url: `${SAMPLE_IMAGES}/verification-photo.jpg` },
    ],
    liveness: 91,
    authenticity: 74,
    summary:
      "Face match is below the auto-approve threshold. Compare the selfie with the licence photo before deciding.",
    ocr: [
      { id: "full-name", label: "Full Name", value: "Carlos Mendoza" },
      { id: "date-of-birth", label: "Date of Birth", value: "3 Feb 1990" },
      { id: "id-number", label: "ID Number", value: "48213077M" },
      { id: "expiry-date", label: "Expiry Date", value: "21 Nov 2029" },
      { id: "nationality", label: "Nationality", value: "Spanish" },
      { id: "gender", label: "Gender", value: "Male" },
    ],
    history: [
      { id: "1", title: "Submission Received", time: "Today at 04:47 AM", actor: "user" },
      { id: "2", title: "Flagged for Manual Review", time: "Today at 04:52 AM", actor: "system" },
      { id: "3", title: "Assigned to Alex Chen", time: "Today at 06:30 AM", actor: "moderator" },
    ],
  },
  {
    userId: "sample-sarah-jenkins",
    caseId: "XP-7721",
    name: "Sarah Jenkins",
    avatarUrl: portrait("women/65"),
    documentType: "National ID (USA)",
    country: "USA",
    faceMatch: 42,
    risk: "high",
    status: "REJECTED",
    reviewer: "System (Auto)",
    submitted: "1d ago",
    documents: [
      {
        id: "front",
        label: "National ID (Front)",
        url: `${SAMPLE_IMAGES}/verification-document.jpg`,
      },
      { id: "selfie", label: "Selfie / Liveness", url: portrait("women/65") },
    ],
    liveness: 64,
    authenticity: 38,
    summary:
      "The face match failed and the document shows signs of editing. Rejected automatically.",
    ocr: [
      { id: "full-name", label: "Full Name", value: "Sarah Jenkins" },
      { id: "date-of-birth", label: "Date of Birth", value: "30 Aug 1991" },
      { id: "id-number", label: "ID Number", value: "D4417-2093-11" },
      { id: "expiry-date", label: "Expiry Date", value: "14 Mar 2025", flagged: true },
      { id: "nationality", label: "Nationality", value: "American" },
      { id: "gender", label: "Gender", value: "Female" },
    ],
    history: [
      { id: "1", title: "Submission Received", time: "Yesterday at 06:41 PM", actor: "user" },
      { id: "2", title: "Automated Checks Failed", time: "Yesterday at 06:42 PM", actor: "system" },
      { id: "3", title: "Rejected Automatically", time: "Yesterday at 06:42 PM", actor: "system" },
    ],
  },
];

/** For the queue's "Showing 1-10 of 142 entries". */
export const SAMPLE_QUEUE_TOTAL = 142;

export const SAMPLE_VERIFICATION_TRENDS: TrendPoint[] = [
  { label: "MON", submissions: 160, approvals: 48 },
  { label: "TUE", submissions: 240, approvals: 120 },
  { label: "WED", submissions: 320, approvals: 240 },
  { label: "THU", submissions: 220, approvals: 97 },
  { label: "FRI", submissions: 360, approvals: 306 },
  { label: "SAT", submissions: 280, approvals: 168 },
  { label: "SUN", submissions: 400, approvals: 380 },
  { label: "MON", submissions: 260, approvals: 143 },
  { label: "TUE", submissions: 340, approvals: 272 },
];

export const SAMPLE_APPROVAL_DISTRIBUTION: ApprovalDistribution = {
  total: 1_200,
  slices: [
    { id: "approved", label: "Approved", value: 82 },
    { id: "pending", label: "Pending", value: 12 },
    { id: "rejected", label: "Rejected", value: 6 },
  ],
};

export const SAMPLE_FRAUD_SIGNALS: FraudSignal[] = [
  { id: "duplicate-ids", label: "Duplicate IDs", value: 42, note: "+8% vs last month" },
  { id: "forged-documents", label: "Forged Documents", value: 18, note: "+2% vs last month" },
  { id: "banned-face-match", label: "Banned Face Match", value: 9, note: "Stable" },
  { id: "sanctioned-countries", label: "Sanctioned Countries", value: 3, note: "Safe Zone" },
];

export const SAMPLE_TOP_MODERATORS: TopModerator[] = [
  { id: "1", name: "Alex Chen", reviews: 142 },
  { id: "2", name: "Maria Khan", reviews: 128 },
  { id: "3", name: "James Bond", reviews: 96 },
];
