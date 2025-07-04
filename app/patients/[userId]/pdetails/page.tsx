import { PatientRegisterForm } from '@/components/form/PatientRegister'
import Image from 'next/image'
import React from 'react'
import { getUserIdFromCookie } from "@/lib/actions/user.action";
import { users } from "@/lib/appwrite.config";

const patient_details = async () => {
    const userId = await getUserIdFromCookie();
    const user = userId ? await users.get(userId) : null;
  return (
  <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
    {/* Map Section - first on mobile */}
    {/* <div className="w-full md:w-3/5 bg-muted px-3 pt-4 md:px-0 md:pt-0 flex items-center justify-center">
      <div className="w-full h-[350px] sm:h-[400px] md:h-[95%] rounded-2xl shadow-2xl overflow-hidden">
        <MapView />
      </div>
    </div> */}

    {/* Form Section */}
    <section className="w-full md:w-4/5 h-screen flex flex-col justify-start px-6 pt-6 pb-4 sm:px-10 md:px-12 lg:px-16 overflow-y-auto  [&::-webkit-scrollbar]:hidden">
      {/* Logo + Tagline */}
      <div className="flex flex-col items-center justify-center -mt-2 mb-3 shrink-0">
        <Image
          alt="logo"
          src="/assets/icons/logo.png"
          height={200}
          width={200}
          className="h-20 sm:h-24 md:h-28 w-auto object-contain"
        />
        <div className="-mt-1 text-center leading-tight">
          <h1 className="text-[1.3rem] font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent">
            ArogyaCompass
          </h1>
          <h2 className="text-sm text-blue-500 mt-0.5">
            Your Smart Path to Faster Care
          </h2>
        </div>
      </div>

      {/* Headings */}
      <div className="mb-5 shrink-0">
        <h1 className="text-2xl font-bold mb-1 text-left">Welcome...</h1>
        <p className="text-base text-dark-600 text-left">
          Let us know more about yourself
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full rounded-xl bg-transparent p-5 shadow-md border border-dark-500 flex-grow ">
        {user && <PatientRegisterForm user={user} />}
      </div>

      {/* Footer */}
      <div className="text-xs mt-3 px-2 flex justify-between text-dark-600 shrink-0">
        <p>&copy; 2025 ArogyaCompass</p>
      </div>
    </section>
   <Image
    src = "/assets/images/register-img.png"
    alt = "patient"
    height = {1000}
    width = {1000}
    className = "side-img max-w-[390px] hidden md:block object-cover h-full"
    /> 
  </div>
  )
}

export default patient_details