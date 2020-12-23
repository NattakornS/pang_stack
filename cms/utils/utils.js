'use-strict'
const status1_pass = 'ศกพ.ตอบรับในสมัคร (การสมัครสมบูรณ์)'
const status1_not_pass = 'รอการตอบรับ'
const status2_pass = 'ผ่านการคัดกรอง รอเข้ารับการคัดเลือก'
const status2_not_pass = 'ใบสมัครไม่ผ่านการคัดกรอง (ยกเลิก) ต้องสมัครใหม่ครั้งหน้า'
const status3_pass = 'ผ่านการคัดเลือก รอเรียกตัวเพื่อแต่งตั้งและบรรจุ'
const status3_not_pass = 'ใบสมัครไม่ผ่านการคัดเลือก (ยกเลิก) ต้องสมัครใหม่ครั้งหน้า'

module.exports = {
  paddingNumber : (input) => {
    var str = "" + input
    var pad = "000"
    var ans = pad.substring(0, pad.length - str.length) + str
    return ans
  },
  dateCheck: (from, to) => {

    var fDate, lDate, cDate;
    fDate = Date.parse(from);
    lDate = Date.parse(to);
    cDate = Date.now()//Date.parse(check);

    if ((cDate <= lDate && cDate >= fDate)) {

      return true;
    }
    return false;
  },
  getStatusMessage: (step, pass) => {
    var message = ''
    switch (step) {
      case 1:
        if (pass) {
          message = status1_pass
        } else {
          message = status1_not_pass
        }
        break
      case 2:
        if (pass) {
          message = status2_pass
        } else {
          message = status2_not_pass
        }
        break
      case 3:
        if (pass) {
          message = status3_pass
        } else {
          message = status3_not_pass
        }
        break
      default:
        message = ''
        break
    }
    return message
  }
}
