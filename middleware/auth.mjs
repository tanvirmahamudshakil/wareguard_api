



function getDifferenceInDays(date1, date2) {
  const diffInMs = Math.abs(date2 - date1);
  return diffInMs / (1000 * 60 * 60 * 24);
}

const token = "d2lyZWd1YXJkLWFi";

async function middle(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  var token1 = req.headers["ab"]
  if (!token1) {
    res.send("Token not found")
  } else {

    if (token === token1) {
      next()

    } else {
      res.send("token is expair")
    }
  }


}

export default middle