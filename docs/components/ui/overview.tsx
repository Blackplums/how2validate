"use client"

import Image from "next/image"
import { signOut } from "next-auth/react"
import { FiInfo } from "react-icons/fi"

import { buttonVariants } from "./button"

export default function UserOverview({
  user,
  reportsSent,
  maxReports,
  tokenCall,
  activeToken,
  maxTokens,
  plan,
}: {
  user: { name: string; email: string; image?: string }
  reportsSent: number
  maxReports: number
  tokenCall: number
  activeToken: number
  maxTokens: number
  plan: string
}) {
  return (
    <div className="mb-6 w-full rounded-2xl border bg-neutral-50 bg-white p-4 shadow-sm dark:bg-neutral-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Profile + Stats */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Profile Info */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-full border bg-neutral-50 dark:bg-neutral-900">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ? `${user.name}'s avatar` : "User avatar"}
                  width={800}
                  height={500}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-lg font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 sm:ml-8 sm:grid-cols-4 sm:gap-6 dark:text-gray-300">
            <div>
              <div>
                <span className="text-2xl font-bold">{reportsSent}</span> /{" "}
                {maxReports}
              </div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Reports Sent &nbsp;
                <FiInfo
                  className="mr-1 inline-block"
                  title="Shows the total number of validation reports sent to your email today. Each report includes detailed results of secrets you&#39;ve checked using How2Validate."
                  aria-label="Reports Sent Info"
                  size={14}
                />
              </div>
            </div>
            <div>
              <div>
                <span className="text-2xl font-bold">{activeToken}</span> /{" "}
                {maxTokens}
              </div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                API Tokens &nbsp;
                <FiInfo
                  className="mr-1 inline-block"
                  title="Shows the total number of active API tokens you have. Each token can be used to authenticate API requests and track usage."
                  aria-label="Reports Sent Info"
                  size={14}
                />
              </div>
            </div>
            <div>
              <div>
                <span className="text-2xl font-bold">{tokenCall}</span>
              </div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Tokens Usage &nbsp;
                <FiInfo
                  className="mr-1 inline-block"
                  title="Indicates the total number of API calls made using your token. This helps track your usage and remaining limit based on your current plan."
                  aria-label="API Token Info"
                  size={14}
                />
              </div>
            </div>
            <div>
              <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xl font-semibold text-blue-800 dark:bg-blue-800 dark:text-white">
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Plan &nbsp;
                <FiInfo
                  className="mr-1 inline-block"
                  title="Displays your current subscription plan and its features, including API limits, report access, and expiration."
                  aria-label="Plan Info"
                  size={14}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Logout Button */}
        <div className="self-start sm:self-auto">
          <button
            onClick={() => signOut()}
            className={buttonVariants({ variant: "destructive" })}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
