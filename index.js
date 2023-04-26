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

const history = [] //для отго чтобы поддерживать беседу

//==============тут все пошло уже по работе с telegram================
const token = '6124493119:AAGGgUFEVNM50V0D2EaGVJ3hvF_wYu1xPuU'

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
   ])

   //вешаем слушатель на то что нам отрпавляем bot
   //msg =  это то что бот возвращает
   bot.on('message', async msg => {
      const chatId = msg.chat.id // непоссредственно id самого чата
      try {
         const text = msg.text //передаем в переменную поля которые передает нам бот это то что передает нам бот

         history.push({ role: 'user', content: text })

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

   // })
}
start()
