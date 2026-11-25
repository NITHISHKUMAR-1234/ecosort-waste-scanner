export type Account = {
  email: string
  password: string
  name: string
  role: string
  dateOfBirth: string
  gender: string
}

export type AppUser = {
  name: string
  email: string | null
}
