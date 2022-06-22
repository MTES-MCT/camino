import '../init.js'

// FIXME
const run = async () => {
  try {
    // await userAdd(knex, {
    //   id: 'admin',
    //   email: process.env.ADMIN_EMAIL,
    //   role: 'super',
    //   dateCreation: dateFormat(new Date(), 'yyyy-mm-dd')
    // })
  } catch (e) {
    console.error(e)
  } finally {
    process.exit(0)
  }
}

run()
