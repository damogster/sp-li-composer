const NORMAL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const BOLD   = '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'
const ITALIC = '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

const boldChars = [...BOLD]
const italicChars = [...ITALIC]
const normalChars = [...NORMAL]

const toBoldMap: Record<string, string> = {}
const toItalicMap: Record<string, string> = {}
const toNormalMap: Record<string, string> = {}

normalChars.forEach((c, i) => {
  toBoldMap[c] = boldChars[i]
  toItalicMap[c] = italicChars[i]
})
boldChars.forEach((c, i) => { toNormalMap[c] = normalChars[i] })
italicChars.forEach((c, i) => { toNormalMap[c] = normalChars[i] })

export const toBold = (s: string) => [...s].map(c => toBoldMap[c] ?? c).join('')
export const toItalic = (s: string) => [...s].map(c => toItalicMap[c] ?? c).join('')
export const toNormal = (s: string) => [...s].map(c => toNormalMap[c] ?? c).join('')
export const isBold = (s: string) => [...s].some(c => boldChars.includes(c))
export const isItalic = (s: string) => [...s].some(c => italicChars.includes(c))
