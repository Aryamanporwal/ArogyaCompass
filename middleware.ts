// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Import your server SDK Appwrite actions
import { getHospitalById, getLabById } from "@/lib/actions/payment.action";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Protect only dashboard routes
  if (pathname.startsWith("/hospital/") && pathname.includes("/dashboard")) {
    const segments = pathname.split("/");
    const hospitalId = segments[2];

    const hospital = await getHospitalById(hospitalId);
    if (!hospital) return NextResponse.redirect(new URL("/404", request.url));

    const timestamp = new Date(hospital.timestamp);
    const now = new Date();
    const daysDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 30 || !hospital.isVerified || !hospital.istrueLocation || !timestamp) {
      const redirectUrl = new URL(`/hospital/${hospitalId}/payment`, request.url);
      redirectUrl.searchParams.set("alert", "Please pay to head to DashBoard");
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (pathname.startsWith("/lab/") && pathname.includes("/dashboard")) {
    const segments = pathname.split("/");
    const labId = segments[2];

    const lab = await getLabById(labId);
    if (!lab) return NextResponse.redirect(new URL("/404", request.url));

    const timestamp = new Date(lab.timestamp);
    const now = new Date();
    const daysDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 30 || !lab.isVerified || !lab.istrueLocation ||!timestamp) {
      const redirectUrl = new URL(`/lab/${labId}/pay`, request.url);
      redirectUrl.searchParams.set("alert", "Please pay to head to DashBoard");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hospital/:path*/dashboard", "/lab/:path*/dashboard"],
};
