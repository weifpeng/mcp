"use client"
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner"

export default function InitWallet() {
  const router = useRouter()

  const { data: isInitSolanaWallet, isLoading } = trpc.isInitSolanaWallet.useQuery()

  const { mutateAsync: initSolanaWallet, isPending } = trpc.initSolanaWallet.useMutation()


  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')


  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast.error('密码不一致')
      return
    }
    try {
      const result = await initSolanaWallet({ password })
      toast.success('初始化成功')
      router.push('/init/success')
    } catch (error) {
      toast.error("初始化失败", {
        description: "请检查密码是否正确",
      })
    }

  }


  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isInitSolanaWallet) {
    return <div>钱包已初始化</div>
  }

  return (
    <div className="min-h-screen bg-white sm:bg-gray-100">
      <div className="flex items-center justify-center min-h-screen px-6 py-8 sm:p-8">
        <div className="w-full max-w-md sm:bg-white sm:shadow-lg sm:rounded-2xl sm:p-8">
          <main className="flex flex-col gap-8 sm:gap-[32px]">
            <div className="flex flex-col gap-3 sm:gap-4 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">初始化您的钱包</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                请设置一个安全的访问密码，该密码将用于保护您的钱包安全。
                请确保妥善保管此密码，因为它无法被找回。
              </p>
            </div>
            <div className="flex flex-col gap-6 sm:gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  钱包访问密码
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="请输入密码"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  确认密码
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
              <button
                className="mt-2 w-full bg-blue-600 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isPending}
                onClick={handleSubmit}
              >
                创建钱包
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
