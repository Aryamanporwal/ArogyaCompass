export function generatePasskey() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
  return randomDigits          
}
