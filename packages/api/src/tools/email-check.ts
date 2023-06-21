const emailRegex = /.+@.+\..+/i // from https://davidcel.is/articles/stop-validating-email-addresses-with-regex/

export const emailCheck = (email: string) => emailRegex.test(email)
