export type Credentials = {
  email: string
  password: string
}

export type SignupDetails = Credentials & {
  username: string
}
