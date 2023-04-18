require('dotenv').config() // для работы с переменными
const { Configuration, OpenAIApi } = require('openai') // для работы с openai

const TelegramApi = require('node-telegram-bot-api') // для взаимодействия с api telegram

const readline = require('readline') // для общения с opanai непосредственно через консоль

//подключаемся к openai используя ключ
const openaiApi = new OpenAIApi(
   new Configuration({
      apiKey: process.env.API_KEY,
   })
)

//подключим интерфейс коотрым с помощью коотрого мы будем общаться(ввод и вывод данных)
const userInterface = readline.createInterface({
   input: process.stdin,
   output: process.stdout,
})

// userInterface.prompt() //так вызывается первое сообщение

const history = [] //для отго чтобы поддерживать беседу

// //вешаем событие на обработку того что мы пишем в консоли
// userInterface.on('line', async line => {
//    //формируем историю
//    history.push({ role: 'user', content: line })

//    //непосредственно подключаемся к openapi res -это ответ того что нам вернет чат openai
//    const res = await openaiApi.createChatCompletion({
//       model: 'gpt-3.5-turbo',
//       messages: history,
//    })
//    console.log(res.data.choices[0].message.content)
//    userInterface.prompt()
// })

//==============тут все пошло уже по работе с telegram================
const token = '6269324931:AAF55QemBACF5cOHfBsp7snvq_4vCFQHIRM'

const bot = new TelegramApi(token, { polling: true })

const chats = {} //это как аналог базы данных

//создадим функцию чтобы она запускала наше приложение
const start = () => {
   //так устанавливаются команды (после этого в боте появяться описание в самой программе появляется меню)
   bot.setMyCommands([
      {
         command: '/start',
         description: 'Начальное привестствие',
      },
      {
         command: '/info',
         description: 'Получить информацию о пользователе',
      },
      {
         command: '/game',
         description: 'Начать ирать',
      },
   ])

   //вешаем слушатель на то что нам отрпавляем bot
   //msg =  это то что бот возвращает
   bot.on('message', async msg => {
      try {
         const text = msg.text //передаем в переменную поля которые передает нам бот это то что передает нам бот

         history.push({ role: 'user', content: text })

         const chatId = msg.chat.id // непоссредственно id самого чата

         const res = await openaiApi.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: history,
         })

         const response = res.data.choices[0].message.content

         await bot.sendMessage(chatId, response)
         // if (text === '/start') {
         //    await bot.sendSticker(
         //       chatId,
         //       'https://tlgrm.ru/_/stickers/9aa/b15/9aab154d-4692-47ff-ac8c-11abf3cde92e/7.jpg' //так можно вставлять стикер в бота
         //    )
         //    return bot.sendMessage(chatId, 'Добро пожаловать в бот') //в данном случаем мы написали что ели боту пошлем start он нам ответит
         // }

         if (text === '/info') {
            return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name}`)
         }
      } catch (err) {
         bot.sendMessage(chatId, err)
      }

      // return bot.sendMessage(chatId, 'Я Вас не понял!')

      //  console.log(msg) // тут мы выводим в консоль то что отправляет бот его ответ
   })

   // прослушивание бота
   // bot.on('callback_query', msg => {
   //    const data = msg.data // это текст самой кнопки что мы отрпавляем
   //    const chatId = msg.message.chat.id //идентификатор чата
   //    if (data === chats[chatId]) {
   //       //chats[chatId] - то какое число загодал сам бот
   //       return bot.sendMessage(
   //          chatId,
   //          `поздравляю ты угадал цифру ${chats[chatId]}`
   //       )
   //    } else {
   //       return bot.sendMessage(
   //          chatId,
   //          `Не угадал я загадал ${chats[chatId]} а ты загадал ${data} `
   //       )
   //    }

   //    //  bot.sendMessage(chatId, `Ты выбрал цифру ${data}`) // льпарвим ользователю сообщение где покажем что выбрал пользователь
   //    //  console.log(msg)
   // })
}
start()
