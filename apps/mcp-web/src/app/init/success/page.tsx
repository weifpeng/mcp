"use client";
import Image from "next/image";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function InitWallet() {
  return (
    <div className="min-h-screen bg-white sm:bg-gray-100">
      <div className="flex items-center justify-center min-h-screen px-6 py-8 sm:p-8">
        <div className="w-full max-w-md sm:bg-white sm:shadow-lg sm:rounded-2xl sm:p-8">
          <main className="flex flex-col gap-8 sm:gap-[32px] items-center">
            <div className="relative ">
              <CheckCircleIcon className=" size-16 text-green-500" />
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold">钱包初始化成功！</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                您的钱包已经成功创建，现在可以开始使用了。
                请记住妥善保管您的访问密码。
              </p>
            </div>

            <div 
              className="w-full bg-blue-600 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            
            >
              开始使用
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
