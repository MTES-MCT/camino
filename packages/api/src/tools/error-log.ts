const errorLog = (error: string, ...args: any[]) => {
  console.error('')
  console.error(' erreur ')
  console.error(error, ...args)
  console.error('')
}

export default errorLog
