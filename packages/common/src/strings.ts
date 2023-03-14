export const capitalize = (text: string): string => {
  if (text.length > 0) {
    return text[0].toUpperCase() + text.substring(1)
  }
  
return text
}
