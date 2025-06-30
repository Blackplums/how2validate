// types/token.ts
export interface TokenUsage {
  day: {
    api: number
    email: number
  }
  total: {
    api: number
    email: number
  }
}

export interface Token {
  token_name: string
  one_time_token: string
  token_hash: string
  previous_hash?: string
  token_email: string
  usage_count?: number
  last_used_at?: Date
  created_at?: Date
  expires_at?: Date
  isActive?: boolean
  usage?: TokenUsage
}

export interface TokenStore {
  user_id: string
  tokens: Token[]
}
