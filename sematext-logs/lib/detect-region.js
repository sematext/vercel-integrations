module.exports = hostname => {
  if (hostname.includes('eu')) {
    return 'eu'
  }
  return 'us'
}
