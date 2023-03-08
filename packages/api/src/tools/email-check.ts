import emailRegex from 'email-regex'

export const emailCheck = (email: string) => emailRegex({ exact: true }).test(email)
