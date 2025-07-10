"use client"

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { FaGithub } from "react-icons/fa"
import { TbEdit, TbRefresh, TbTrash } from "react-icons/tb"
import { toast } from "sonner"

import { Token } from "@/types/pa-token"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import UserOverview from "@/components/ui/overview"

interface EditFormData {
  token_email: string
  token_name: string
}

export default function TokenManager() {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [tokens, setTokens] = useState<Token[]>([])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [modalType, setModalType] = useState<"create" | "edit">("create")
  const [formData, setFormData] = useState<Omit<EditFormData, "token_hash">>({
    token_email: "",
    token_name: "",
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [visibleTokenIndex, setVisibleTokenIndex] = useState<number | null>(
    null
  )
  const { data: session, status } = useSession()
  const { id: userId } = (session?.user as {
    id: string
  }) || { id: "" }
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    image: "",
    reportsSent: 0,
    maxReports: 0,
    tokenCall: 0,
    activeToken: 0,
    maxTokens: 0,
    plan: "Pro-Free",
  })

  // Fetch both user info and tokens, and set dataLoaded only when both are done
  useEffect(() => {
    if (!userId) return
    // let tokensFetched = false
    // let userInfoFetched = false

    fetch(`/api/userinfo?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserInfo(data)
        // userInfoFetched = true
      })

    fetch(`/api/tokens?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setTokens(data[0]?.tokens || [])
        // tokensFetched = true
        setDataLoaded(true)
      })
      .catch(() => {
        // tokensFetched = true
        setDataLoaded(true)
      })
  }, [userId])

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white/80 p-8 text-center shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-black/80">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Hacker 🥷🏻
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300"></p>
          <button
            onClick={() => signIn("github")}
            className={buttonVariants({ variant: "default" })}
          >
            <FaGithub size={20} />
            Sign-In to continue with GitHub
          </button>
        </div>
      </div>
    )
  }

  const openModal = (type: "create" | "edit", index: number | null = null) => {
    setModalType(type)
    setShowModal(true)
    if (type === "edit" && index !== null) {
      const { token_email, token_name } = tokens[index]
      setFormData({ token_email, token_name })
      setEditIndex(index)
    } else {
      setFormData({ token_email: "", token_name: "" })
      setEditIndex(null)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({ token_email: "", token_name: "" })
    setEditIndex(null)
  }

  const handleCreateTokenClick = async () => {
    const allowed = await fetch(
      `/api/check-api-threshold?userId=${userId}`
    ).then((res) => res.json())
    if (!allowed) {
      toast.error(
        "You can't create a new token. Delete an existing one or update its name/email to continue.",
        { duration: 8000 }
      )
      return
    }
    openModal("create")
  }

  const generateToken = async () => {
    const res = await fetch("/api/tokens/generatetoken", { method: "POST" })
    if (!res.ok) throw new Error("Failed to generate token")
    return res.json()
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Normalize inputs for case-insensitive comparison
    const inputEmail = formData.token_email.trim().toLowerCase()
    const inputName = formData.token_name.trim().toLowerCase()

    const isDuplicate = tokens.some((token, index) => {
      if (modalType === "edit" && index === editIndex) return false
      return (
        token.token_email.trim().toLowerCase() === inputEmail ||
        token.token_name.trim().toLowerCase() === inputName
      )
    })

    if (isDuplicate) {
      toast.error("Token name or email already taken.")
      return
    }

    const { token, tokenHash } = await generateToken()

    const newToken = {
      token_name: formData.token_name,
      one_time_token: token,
      token_hash: tokenHash,
      previous_hash: "",
      token_email: formData.token_email,
      usage_count: 0,
      last_used_at: new Date(),
      created_at: new Date(),
      expires_at: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ),
      isActive: true,
      usage: {
        day: { api: 0, email: 0 },
        total: { api: 0, email: 0 },
      },
    }

    if (modalType === "create") {
      setTokens([...tokens, newToken])
      await mutateToken(userId, newToken).then(() => {
        toast.success("Token created successfully")
      })
      setVisibleTokenIndex(tokens.length)
    } else if (modalType === "edit" && editIndex !== null) {
      const updatedTokens = [...tokens]
      updatedTokens[editIndex] = {
        ...tokens[editIndex],
        ...formData,
        token_hash: updatedTokens[editIndex].token_hash,
      }
      setTokens(updatedTokens)
      await mutateToken(userId, updatedTokens[editIndex]).then(() => {
        toast.success("Token updated successfully")
      })
    }

    closeModal()
  }

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this token?")) {
      setTokens(tokens.filter((_, i) => i !== index))
      deleteToken(userId, tokens[index].token_hash).then(() => {
        toast.success("Token deleted successfully")
      })
      if (visibleTokenIndex === index) setVisibleTokenIndex(null)
    }
  }

  const handleRegenerateToken = async (index: number) => {
    // 1. Generate a new token
    const { token, tokenHash } = await generateToken()

    // 2. Update the token at the given index
    const updatedTokens = [...tokens]
    const oldToken = updatedTokens[index]

    const newToken = {
      ...oldToken,
      one_time_token: token,
      previous_hash: oldToken.token_hash,
      token_hash: tokenHash,
      last_used_at: new Date(),
      created_at: new Date(),
    }

    updatedTokens[index] = newToken
    setTokens(updatedTokens)

    // 3. Persist the update to the server
    await mutateToken(userId, newToken, "PUT").then(() => {
      toast.success("Token regenerated successfully")
    })

    // 4. Show the new token for copying
    setVisibleTokenIndex(index)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Token copied to clipboard!")
    })
  }

  const mutateToken = async (
    userId: string,
    token: Token,
    mode: "POST" | "PUT" | "DELETE" = "POST"
  ) => {
    const res = await fetch(`/api/tokens/${userId}`, {
      method: mode,
      body: JSON.stringify(token),
      headers: { "Content-Type": "application/json" },
    })
    return res.json()
  }

  const deleteToken = async (userId: string, token_hash: string) => {
    const res = await fetch(`/api/tokens/${userId}`, {
      method: "DELETE",
      body: JSON.stringify({ token_hash }),
      headers: { "Content-Type": "application/json" },
    })
    return res.json()
  }

  return !dataLoaded ? (
    <LoadingSpinner />
  ) : (
    <div className="min-h-screen p-4 md:p-6">
      <UserOverview
        user={{
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
        }}
        reportsSent={userInfo.reportsSent}
        maxReports={userInfo.maxReports}
        tokenCall={userInfo.tokenCall}
        activeToken={userInfo.activeToken}
        maxTokens={userInfo.maxTokens}
        plan={userInfo.plan}
      />
      <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
        <h1 className="mb-4 text-2xl font-bold md:mb-0">
          Personal Access Tokens
        </h1>
        <div className="space-x-2">
          <button
            className={buttonVariants({ variant: "outline" })}
            onClick={() => handleCreateTokenClick()}
          >
            + Create New Token
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mb-4 rounded-md border p-4 text-sm tracking-wide",
          "bg-neutral-50 dark:bg-neutral-900"
        )}
      >
        <p>
          Personal Access Tokens function like ordinary OAuth access tokens.
          They are used by client tools for authenticating you and allowing you
          to submit jobs. You can create as many tokens as you want and delete
          tokens that are no longer needed. You will only see a newly-created
          token until the first time you refresh the page. &nbsp;
          <strong className="text-red-600 dark:text-red-400">
            We do not store tokens for security reasons; please make sure to
            copy the token right away.
          </strong>
        </p>
      </div>

      <div className="w-full">
        {/* Show table on medium+ screens */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse border">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Token</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <td className="border px-4 py-2">{token.token_name}</td>
                  <td className="border px-4 py-2">{token.token_email}</td>
                  <td className="border px-4 py-2">
                    {visibleTokenIndex === index ? (
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="break-all">
                            {token.one_time_token}
                          </span>
                          <button
                            className="ml-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                            onClick={() =>
                              copyToClipboard(token.one_time_token)
                            }
                          >
                            Copy
                          </button>
                        </div>
                        <div className="mt-1 rounded border border-yellow-400 bg-yellow-100 px-2 py-1 text-sm text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900">
                          <strong>Make sure to copy the token now.</strong> You
                          won’t be able to see it again.
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        &lt;token hidden&gt;
                      </span>
                    )}
                  </td>
                  <td className="space-x-2 border px-4 py-2">
                    <button
                      className={buttonVariants({
                        variant: "outline",
                        size: "icon",
                      })}
                      onClick={() => handleRegenerateToken(index)}
                      aria-label="Regenerate Token"
                      title="Regenerate Token"
                    >
                      <TbRefresh className="h-[1.1rem] w-[1.1rem]" />
                    </button>
                    <button
                      className={buttonVariants({
                        variant: "outline",
                        size: "icon",
                      })}
                      onClick={() => openModal("edit", index)}
                      aria-label="Edit Token"
                      title="Edit Token"
                    >
                      <TbEdit className="h-[1.1rem] w-[1.1rem]" />
                    </button>
                    <button
                      className={buttonVariants({
                        variant: "destructive",
                        size: "icon",
                      })}
                      onClick={() => handleDelete(index)}
                      aria-label="Delete Token"
                      title="Delete Token"
                    >
                      <TbTrash className="h-[1.1rem] w-[1.1rem]" />
                    </button>
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No tokens available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card layout on small screens */}
        <div className="space-y-4 md:hidden">
          {tokens.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No tokens available.
            </div>
          ) : (
            tokens.map((token, index) => (
              <div
                key={index}
                className="rounded border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2">
                  <strong>Name:</strong> {token.token_name}
                </div>
                <div className="mb-2">
                  <strong>Email:</strong> {token.token_email}
                </div>
                <div className="mb-2">
                  <strong>Token:</strong>{" "}
                  {visibleTokenIndex === index ? (
                    <>
                      <div className="flex justify-between">
                        <span className="break-all">
                          {token.one_time_token}
                        </span>
                        <button
                          className="ml-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                          onClick={() => copyToClipboard(token.one_time_token)}
                        >
                          Copy
                        </button>
                      </div>
                      <div className="mt-2 rounded border border-yellow-400 bg-yellow-100 px-2 py-1 text-sm text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900">
                        <strong>Make sure to copy the token now.</strong> You
                        won’t be able to see it again.
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">&lt;token hidden&gt;</span>
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    className={buttonVariants({
                      variant: "outline",
                      size: "icon",
                    })}
                    onClick={() => handleRegenerateToken(index)}
                    aria-label="Regenerate Token"
                    title="Regenerate Token"
                  >
                    <TbRefresh className="h-[1.1rem] w-[1.1rem]" />
                  </button>
                  <button
                    className={buttonVariants({
                      variant: "outline",
                      size: "icon",
                    })}
                    onClick={() => openModal("edit", index)}
                    aria-label="Edit Token"
                    title="Edit Token"
                  >
                    <TbEdit className="h-[1.1rem] w-[1.1rem]" />
                  </button>
                  <button
                    className={buttonVariants({
                      variant: "destructive",
                      size: "icon",
                    })}
                    onClick={() => handleDelete(index)}
                    aria-label="Delete Token"
                    title="Delete Token"
                  >
                    <TbTrash className="h-[1.1rem] w-[1.1rem]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {showModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">
              {modalType === "create" ? "Create New Token" : "Edit Token"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-1 block">Email</label>
                <input
                  type="email"
                  name="token_email"
                  value={formData.token_email}
                  onChange={handleChange}
                  className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block">Token Name</label>
                <input
                  type="text"
                  name="token_name"
                  value={formData.token_name}
                  onChange={handleChange}
                  className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  {modalType === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
