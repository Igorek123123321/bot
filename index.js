process.env.TZ = "Europe/Moscow"; // Часовой пояс, а Выше убрать ошибки из консоли!
/*----------------------------------------------------------------------------------------------------------*/
/*Подключение бота к сообществу:*/
/*----------------------------------------------------------------------------------------------------------*/
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.listen(90);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/views'));
const config = require("./config.json"); // НАСТРОЙКА БОТА!
const { VK, Keyboard } = require('vk-io');
const vk = new VK({
    token: config.access_token.group1,
    lang: "ru",
    pollingGroupId: config.id.group1,
    apiMode: "parallel"
});
const page = new VK({ token: config.access_token.page1 });
const cgroup = config.id.group1;
const { updates } = vk;
const db = require("./modules/MongoConnect"); // Подключение к БАЗЕ ДАННЫХ!
const utils = require("./modules/utils"); // Дополнения к боту [КрасиВые деньги, ID игрока и др.]
const request = require("request"); // Запросы к сайтам!
const rq = require("prequest");
const user = require("./modules/ProfileConnect"); // Профили игроков/информация!
const users = require("./modules/ProfileConnect"); // Профили игроков/информация!
const md5 = require('md5');
const moment = require('moment'); // Красивое время!
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(890, 445);
const { group } = require('console');
const { stat } = require('fs');

/*----------------------------------------------------------------------------------------------------------*/
/*Переменные:*/
/*----------------------------------------------------------------------------------------------------------*/
let average = 50; // Среднее арифметическое
let random_price_bal = 60; // Рандомное
const random_price_rub = 2; // Цена за покупку в рублях
let first_price_bal = 1000; // Первое
const first_price_rub = 10; // Цена за покупку в рублях
let apart_price_bal = 1400; // Отдельное
const apart_price_rub = 15; // Цена за покупку в рублях
const securing = 30; // Цена за покупку закрепа
const photobattle_bal = 1000; // Цена за покупку фотобатла
const photobattle_rub = 20; // Цена за покупку фотобатла
let tape = ["🐒", "🍇", "🍌", "🍋", "🍒"];
let lpost = null; // Последний пост
let lowner_id = [];
let lid = [];
const vip_one_day = parseFloat(2); // Стоимость VIP на 1 день
const sell_rub = 100; // Цена за продажу рубля
const buy_rub = 500; // Цена за покупку рубля
let purchase_time = 43200000; // Время на покупку в лт
const post_message = ["150 ❤ и следующий батл", "берём тех, кто лайкает 🍒", "хочешь в батл ? 🤤\n\nТогда пиши в лс группы 🍀", "наберём за 15 минут 152 💕?", "наберём за 25 минут 278💕?"];
const comment_message = ["Даю тебе баллы за активность 🔥", "Лови баллы за активность 💦", "🌚 Спасибо за активность, даю баллы!", "Ты получаешь баллы за активность 😗"]

// Menu:
const report = 404; // Репорт
const answer = 405; // Ответ на репорт
const donate = 10000; // Донат
const mixed = 100; // рандом
const first = 101; // Первое
const apart = 102; // Отдельное
const chest = 200; // Сундук
const nickname = 5; // Смена ника
const vip = 300; // Покупка VIP
const pass = 6; // Передача
const change = 8; // Обменник
const change_balance = 81; // Обменять баланс на рубли
const change_rub = 82; // Обменять рубли на баланс
const photobattle = 400; // Меню покупки фотобатл

// Часто используемые клавиатуры:
let rub_and_bal = {
    disable_mentions: 1,
    keyboard: JSON.stringify({
        inline: true,
        buttons: [
            [{ "action": { "type": "text", "label": "Рубли ₽" }, "color": "positive" },
            { "action": { "type": "text", "label": "🌟 Баллы" }, "color": "positive" }]
        ]
    })
}

let donate_keyboard = {
    disable_mentions: 1,
    keyboard: JSON.stringify({
        inline: true,
        buttons: [
            [{ "action": { "type": "text", "label": "♻ Обменник" }, "color": "secondary" }],
            [{ "action": { "type": "text", "label": "🗯 Как ещё получить баллы" }, "color": "secondary" }],
            [{ "action": { "type": "text", "label": "Пополнить 💵" }, "color": "positive" }]
        ]
    })
}

let shop = {
    disable_mentions: 1,
    keyboard: JSON.stringify({
        inline: true,
        buttons: [
            [{ "action": { "type": "text", "label": "💒 Магазин" }, "color": "negative" }]
        ]
    })
}

let buy_vip_keyboard = {
    disable_mentions: 1,
    keyboard: JSON.stringify({
        inline: true,
        buttons: [
            [{ "action": { "type": "text", "label": "Купить VIP статус 🤤" }, "color": "secondary" }]
        ]
    })
}

let check = {
    disable_mentions: 1,
    keyboard: JSON.stringify({
        inline: true,
        buttons: [
            [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
            [{ "action": { "type": "text", "label": "Проверка 👀" }, "color": "positive" }]
        ]
    })
}

let feature = {
    disable_mentions: 1,
    keyboard: JSON.stringify({
        inline: true,
        buttons: [
            [{ "action": { "type": "open_app", "app_id": 7435620, "hash": "123", "label": `Какие фишки бота? 🤖` } }],
            [{ "action": { "type": "text", "label": "Команды 📝" }, "color": "secondary" }],
            [{ "action": { "type": "text", "label": "Бонус" }, "color": "positive" }],
        ]
    })
}


/*----------------------------------------------------------------------------------------------------------*/
/*Регистрация пользователя:*/
/*----------------------------------------------------------------------------------------------------------*/
console.log("[Лайк Бот] Бот успешно загружен!"); // Сообщение в консоль
/*----------------------------------------------------------------------------------------------------------*/
updates.startPolling();
updates.on('message', async (msg, next) => {
    if (msg.senderId < 0) return; // Игнор если пишет группа!
    if (/\[club165367966\|(.*)\]/i.test(msg.text)) msg.text = msg.text.replace(/\[club165367966\|(.*)\]/ig, '').trim(); // group
    let NewUser = await db().collection("users").findOne({ vk: msg.senderId });
    msg.user = await user(msg.senderId); // Взаимодействие с игроком!
    if (!NewUser) {
        let [IUser] = await vk.api.users.get({ user_ids: msg.senderId });
        await utils.regDataBase(IUser.id);
        if (!msg.isChat) await msg.send(`Привет 🔥!\n\n В чём фишка бота? 👇🏻`, feature);
    }

    if (msg.hasAttachments()) {
        if (msg.attachments[0].toString() == 'market-165367966_4288523' || msg.attachments[0].toString() == 'market-165367966_4288523' || msg.attachments[0].toString() == 'market-165367966_4288523') {
            return msg.send(`💌 Мы очень благодарны за то, что Вы хотите прикупить у нас платную услугу\n\n🤖 Наш умный бот сделает Вашу покупкой быстрой и лёгкой, для этого перейдите в магазин`, shop)
        }
    }

    if (msg.referralSource && msg.referralValue) {
        if (msg.referralSource && msg.referralValue == msg.senderId) return msg.send(`⚠ Вы не можете активировать своё приглашение.`);
        if (msg.user.ref) return msg.send(`⚠ Вы уже активировали приглашение.`);

        let ui = Number(msg.referralSource);
        let id = await utils.vkId(ui),
            t = await users(id);
        if (!t) return msg.send(`⚠ Игрок не найден.`);

        t.referrals += 1;
        vk.api.messages.send({ user_id: t.vk, random_id: Math.random() * 99999, message: `✅ Ваш @id${msg.senderId} (друг) активировал вашу реферальную ссылку \n\n Теперь за проявленную активность Ваш реферал будет приносить Вам баллы 💫` });

        msg.user.ref = msg.referralSource;
        msg.user.balance += 50;
        msg.user.rub += 1;
        return msg.send(`✅ Вы успешно активировали приглашение [id${t.vk}|друга], Вам было начисленно 50🌟 и 1₽ \n Так же Вам доступна команда "Бонус"`);
    }

    if (!msg.text) return; // Игнор если не текст!
    msg.name = `[id${msg.senderId}|${msg.user.name}]`;
    msg.original = msg.text// Так надо :D
    msg.params_org = msg.original.split(" "); // Так надо :D
    msg.params_org.shift(); // Так надо :D
    msg.params = msg.text.split(" "); // Так надо :D
    msg.params.shift(); // Так надо :D
    msg.params_alt = msg.text.split(" "); // Так надо :D
    console.log(`Новое сообщение от ID: ${msg.senderId} (${msg.user.name})\n MSG: ${msg.text}`);

    msg.user.lastOnline = Date.now(); // Дата последнего сообщения!
    msg.user.cmd += 1;

    if (msg.user.balance < 0 || isNaN(msg.user.balance) || !isFinite(msg.user.balance)) {
        msg.user.balance = 20
    }

    if (msg.user.rub < 0 || isNaN(msg.user.rub) || !isFinite(msg.user.rub)) {
        msg.user.rub = 1
    }

    if (msg.user.cmd >= 100 || msg.user.cmd < 1000) {
        let cmd = msg.user.cmd,
            prize;
        switch (cmd) {
            case 100:  // if (x === 'value1')              
                prize = 100;
                break;
            case 200:  // if (x === 'value1')              
                prize = 200;
                break;
            case 250:  // if (x === 'value2')
                prize = 250;
                break;
            case 300:  // if (x === 'value1')              
                prize = 300;
                break;
            case 400:  // if (x === 'value1')              
                prize = 400;
                break;
            case 500:  // if (x === 'value1')              
                prize = 500;
                break;
            case 600:  // if (x === 'value1')              
                prize = 600;
                break;
            case 700:  // if (x === 'value1')              
                prize = 700;
                break;
            case 800:  // if (x === 'value1')              
                prize = 800;
                break;
            case 900:  // if (x === 'value1')              
                prize = 900;
                break;
            case 1000:  // if (x === 'value1')              
                prize = 1000;
                break;
        }

        if (prize) {
            msg.send(`Вы ввели уже ${cmd} команд 💥 \n\n💫 За это Вы получаете небольшой бонус в виде ${prize} баллов 🌟\nОгромное спасибо что Вы с нами 💓`);
            msg.user.balance += Number(prize);
        }
    }

    msg.answer = (text, params = {}) => {
        params.disable_mentions = 1
        return msg.send(`${msg.name}, ${text}`, params)
    }

    if (NewUser) {
        if (msg.user.vip.access) {  // Если закончилась VIPка - отнимаем
            let end_vip = msg.user.vip.time - Date.now(); // Формула которая считает конец времени VIP
            if (end_vip <= 0) {
                let s = msg.user.vip; // Выдаём VIP статус
                s.access = false;
                s.time = 0;
                msg.user.vip = s;
                msg.answer(`у Вас истёк срок действия VIP статус 😢`, buy_vip_keyboard);
            }
        }
    }
    await next(); // Так надо :/
});

/*-------------------------------------------------------------------*/
/*     |                   Функции Выдачи                      
/*-------------------------------------------------------------------*/

async function givingLikes() {
    let quantity;
    await page.api.wall.get({
        owner_id: -cgroup,
        count: 1,
        extended: 1,
        offset: 1
    }).then(function (a) {
        lpost = a.items[0].id;
        lowner_id = [];
        lid = [];

        if (a.items[0].attachments.length > 1) {
            for (let i = 0; i < a.items[0].attachments.length; i++) {
                lowner_id.push(a.items[0].attachments[i].photo.owner_id);
                lid.push(a.items[0].attachments[i].photo.id);
            }
        }
        quantity = a.items[0].likes.count;
    })
    await page.api.likes.getList({
        type: 'post',
        owner_id: -cgroup,
        item_id: lpost,
        filter: 'likes',
        friends_only: 0,
        extended: 1,
        offset: 0,
        count: 0,
        skip_own: 0
    }).then(function (c) {
        c.items.map(async z => {
            let id = await utils.vkId(z.id),
                t = await users(id);
            if (!t) {
                utils.regDateBase(z.id);
                return;
            }
            if (t.vk) {
                if (t.lpost1 === lpost) return;
                if (quantity >= 20) {
                    if (t.alert && !t.vip.access) {
                        vk.api.messages.send({
                            user_id: t.vk,
                            message: `💌 [id${t.vk}|Вам] выдано +25 баллов 🌟\n💬 Если постараетесь в следующий раз чуточку быстрее, то получите в два раза больше баллов, включайте уведомления о новых записях ❗\n\n 👩‍💻 Если Вам мешают уведомления, можно выключить их командой "уведомления"`, keyboard: JSON.stringify({
                                inline: true,
                                buttons: [
                                    [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                                    [{ "action": { "type": "text", "label": "Проверка 👀" }, "color": "positive" }]
                                ]
                            })
                        }).catch((error) => { throw error; });
                        t.balance += parseFloat(25);
                        t.points += parseFloat(25);
                    }
                    if (t.alert && t.vip.access) {
                        vk.api.messages.send({
                            user_id: t.vk,
                            message: `💌 [id${t.vk}|Вам] выдано +5O баллов 🌟 \n(действует VIP статус 💎)\n💬 Если постараетесь в следующий раз чуточку быстрее, то получите в два раза больше баллов, включайте уведомления о новых записях ❗\n\n 👩‍💻 Если Вам мешают уведомления, можно выключить их командой "уведомления"`, keyboard: JSON.stringify({
                                inline: true,
                                buttons: [
                                    [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                                    [{ "action": { "type": "text", "label": "Проверка 👀" }, "color": "positive" }]
                                ]
                            })
                        }).catch((error) => { throw error; });
                        t.balance += parseFloat(50);
                        t.points += parseFloat(50);

                    }
                } else {
                    if (t.alert && !t.vip.access) {
                        vk.api.messages.send({
                            user_id: t.vk,
                            message: `💌 [id${t.vk}|Вам] выдано +5O баллов 🌟\n([id${t.vk}|Вы] быстро проявили активность 😍)\n\n 👩‍💻 Если Вам мешают уведомления, можно выключить их командой "уведомления"`, keyboard: JSON.stringify({
                                inline: true,
                                buttons: [
                                    [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                                    [{ "action": { "type": "text", "label": "Проверка 👀" }, "color": "positive" }]
                                ]
                            })
                        }).catch((error) => { throw error; });
                        t.balance += parseFloat(50);
                        t.points += parseFloat(50);

                    }
                    if (t.alert && t.vip.access) {
                        vk.api.messages.send({
                            user_id: t.vk,
                            message: `💌 [id${t.vk}|Вам] выдано +1OO баллов 🌟 \n(действует VIP статус 💎 + [id${t.vk}|Вы] быстро проявили активность 😍)\n\n 👩‍💻 Если [id${t.vk}|Вам] мешают уведомления, можно выключить их командой "уведомления"`, keyboard: JSON.stringify({
                                inline: true,
                                buttons: [
                                    [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                                    [{ "action": { "type": "text", "label": "Проверка 👀" }, "color": "positive" }]
                                ]
                            })
                        }).catch((error) => { throw error; });
                        t.balance += parseFloat(100);
                        t.points += parseFloat(100);

                    }
                }

                if (t.ref) {
                    let whom = await utils.vkId(t.ref),
                        target = await users(whom);
                    target.balance += 10;
                    if (target.alert) vk.api.messages.send({
                        user_id: target.vk, message: `💌 Вам выдано +10 баллов 🌟 за то, что Ваш [id${t.vk}|реферал] проявил активность\n\n 👩‍💻 Если Вам мешают уведомления, можно выключить их командой "уведомления"`, keyboard: JSON.stringify({
                            inline: true,
                            buttons: [
                                [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }]
                            ]
                        })
                    }).catch((error) => { throw error; });
                }

                if (t.autobuy && t.balance >= first_price_bal) { // Если включена автопокупка и есть баллы на счету
                    t.balance -= first_price_bal; // Отнимаем баллы                    
                    let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&page=new_queue_lt&photo=https://vk.com/id' + t.vk + '&position=0&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh';
                    request(link, function (error, response, body) {
                    })
                }

                console.log(`🌟 Выдаю баллы ему - ${t.vk} (${t.name}) ✅`);
                t.lpost1 = lpost;
            }
        });
    });
};

setInterval(givingLikes, 60000);

// Функция проверки активности и изменения цен:
async function checkActivity() {
    let x = 0;
    page.api.wall.get({
        count: 7,
        owner_id: -cgroup
    }).then(function (a) {
        for (let i = 2; i < 7; i++) {
            x = x + a.items[i].likes.count;
        }
        average = x / 5;
        random_price_bal = average * 10;
        first_price_bal = average * 20;
        apart_price_bal = average * 30;
        console.log(`Обновляю цены на покупку в магазине: \nРандомное: ${random_price_bal} \nПервое: ${first_price_bal}\nОтдельное: ${apart_price_bal}\n\nСреднее число лайков за последние 5 постов: ${average}`);
    })

    // let timeNow = new Date();
    // if (timeNow.getHours() === 5) {
    //     db().collection('users').updateMany({}, {
    //         $set: {
    //             points: 0,
    //         }
    //     })
    // }
}
setInterval(checkActivity, 3600000);

async function updateWidget() {
    console.log(`Обновляю виджет..`);
    let time = new Date();
    db().collection('users').find({ "admin": false }).project({ "vk": 1, "name": 1, "points": 1 }).sort({ "points": -1 }).limit(5).toArray((err, res) => {

        const script = {
            title: `📃 Активные на ${time.toTimeString()}`,
            head: [

                {
                    text: 'ВКонтакте 🏦'
                },

                {
                    text: 'Заработано баллов ✨',
                    align: 'right'
                }
            ],
            more: "Потратить баллы", // текст доп ссылки
            more_url: "https://vk.com/app7435620", // Дополнительная ссылка
            title_url: "https://vk.com/app7435620", // Дополнительная ссылка
            body: []
            //https://vk.com/@bots_likes-aktivnost-v-bote-faq-bota
        };

        res.map((user, i) => {
            script.body.push([
                {
                    icon_id: `id${user.vk}`,
                    text: `${user.name}`,
                    url: `vk.com/id${user.vk}`
                },
                {
                    text: `${utils.toCommas(user.points)} 🌟`
                },
            ]);
        });

        request.post({
            url: 'https://api.vk.me/method/appWidgets.update', form: {
                v: '5.101',
                type: 'table',
                code: `return ${JSON.stringify(script)};`,
                access_token: 'faca9379f6775edf301f32f8350a4659e114f0bf6b5253f252def94c127994fdb8bea73c4dddba0d380f6'
            }
        },
            function (err, resp, body) {
                console.log(body)
            });

    });
};


setInterval(updateWidget, 1800000)

//////////////////

updates.hear(/^(раздать\sзавершить\s[0-9]+\s(баланс)\s[0-9]+)/ig, async (msg) => {
    if (!msg.user.admin) return;
    const balance = utils.moneysg(msg.params_org[3], 0);
    if (!Number(balance)) return;

    await page.api.wall.getReposts({
        owner_id: -168009141, // ID ГРУППЫ
        post_id: Number(msg.params_org[1]), // ID ПОСТА
        count: 1000
    }).then((res) => {
        res.items.map(async z => {
            let getUser = await user(z.from_id)
            if (!getUser.vk) return;

            getUser.balance += balance
            getUser.rub += 9
            vk.api.messages.send({
                random_id: 0,
                user_id: getUser.vk,
                message: `‼ Вы получили ${utils.toCommas(balance)}🌟 и 9₽ за участие в раздаче 💥\n Спасибо за то, что Вы с нами 💓 \n\n Потратить средства Вы можете в разделе "магазин". Пополнить рубли можно автоматически командой "пополнить"` // КАКОЙ ТЕКСТ ОТПРАВИТЬ В ЛС?
            });

            return msg.send(`Раздача успешно завершена ✅\n\n👥 Участников: ${res.items.length}`);
        });
    });
});

updates.hear(/^(?:(р[ао][сз]дач[яа]))$/ig, async (msg) => {
    let [IUser] = await vk.api.users.get({ user_ids: msg.senderId });

    // if (!msg.user.admin) return msg.answer(`❌ Раздача по слову на данный момент окончена! \n\n Если Вы хотите получить VIP статус на НЕДЕЛЮ, то Вам необходимо сделать репост записи \n(раздача по репостам состоится в понедельник)`);
    if (IUser.is_closed == true) return msg.answer(`❌ Ваша страница закрыта! Просьба открыть её и повторить попытку..`); // Если закрыта страничка
    if (msg.user.vip.access) return msg.answer(`❌ у Вас уже есть VIP статус ✨`);

    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": "Возможности VIP 💎" }, "color": "secondary" }]
            ]
        })
    }

    let s = msg.user.vip; // Выдаём VIP статус
    s.access = true;
    s.time = getUnix() + 172800000;
    msg.user.vip = s;

    msg.user.quest = true;
    return msg.answer(`Вы получили VIP статус в раздаче✨\n 💌 Огромное спасибо что [id${msg.user.vk}|Вы] с нами 🥰 \n\nУзнать [id${msg.user.vk}|Ваши] ноВые возможности можно тут 👇🏻`, keybo);
});

updates.hear(/^(?:проверка 👀|проверка|проверь|проверить)$/i, async (msg) => {
    // переменные:
    let smsg = ``;
    let lpost1 = msg.user.lpost1;
    let stop = false; // Остановиться по умолчанию или нет

    // проверки:
    if (lpost === null) { // если не обновлён пост
        await page.api.wall.get({ owner_id: -cgroup, count: 1, extended: 1, offset: 1 }).then(function (a) {
            lpost = a.items[0].id;
            lowner_id = [];
            lid = [];
            if (a.items[0].attachments.length > 1) {

                for (let i = 0; i < a.items[0].attachments.length; i++) {
                    lowner_id.push(a.items[0].attachments[i].photo.owner_id);
                    lid.push(a.items[0].attachments[i].photo.id);
                }
            }
        })

    }

    if (lowner_id.length <= 0) return msg.answer(`На последнем посту всего одна фотография ☺ \n\n Данная проверка работает только если есть несколько фото 🗿`);
    if (lpost1 != lpost) return msg.answer(`подарите любовь на последнем посту, дождитесь когда Вам дадут за него баллы и повторите попытку ❗\n\n👉🏻 https://vk.com/wall-${cgroup}_${lpost}`);
    if (lpost == msg.user.lastlikes1) return msg.answer(`вы уже получили баллы за пост 🥰\n👉🏻 https://vk.com/wall-${cgroup}_${lpost} \n\n Приходите снова когда выйдет новый пост 👻`, shop);

    await msg.answer(`запускаю проверку 🔎`);
    for (let i = 0; i < lowner_id.length; i++) { // проверка

        let now_owner_id = lowner_id[i];
        let now_id = lid[i];
        if (stop) return;
        await page.api.likes.isLiked({ type: "photo", user_id: msg.user.vk, owner_id: now_owner_id, item_id: now_id }).then(function (a) {

            if (a.liked == 1) smsg += `vk.com/photo${now_owner_id}_${now_id} ✅\n`
            else {
                msg.answer(`‼ Вы забыли подарить здесь 🚫: vk.com/photo${now_owner_id}_${now_id}`);
                stop = true;
                return msg.send(`Проверку останавливаем ⚠ \n 👣 Подарите любовь всем участникам поста \n(👉🏻 https://vk.com/wall-${cgroup}_${lpost}) \nи повторите попытку 💭 \n\n Только тогда мы подарим Вам баллы 💫`, check);
            }
        })
    }

    await msg.answer(`👉🏻 "Любовь" подарена здесь: \n ${smsg}`) // вывод текста

    if (!stop) {
        let ball = 100;
        if (msg.user.vip.access) ball = 150;
        msg.user.lastlikes1 = lpost;
        msg.user.balance += Number(ball);
        msg.user.points += Number(ball);

        return msg.send(`Проверка пройдена 💥 \n Вы подарили "любовь" всем участникам последнего поста 💕\n\nВы получаете: ${ball} 🌟`, shop);
    }
});


// updates.hear(/^(?:test)$/i, async (msg) => {
// return msg.send(`🕵 Недостаточно прав! Данная команда доступна Администраторам`, {
//     keyboard: 
//     Keyboard.keyboard([
//         [
//         Keyboard.callbackButton({
//             label: "Отправить команду.",
//             payload: {
//                 command: "проверка",
//                 userId: msg.userId
//             },
//             color: Keyboard.POSITIVE_COLOR
//         }),
//         Keyboard.callbackButton({
//             label: "Открыть ссылку.",
//             payload: {
//                 link: "https://vk.com/feed"
//             },
//             color: Keyboard.PRIMARY_COLOR
//         })
//         ], // Две кнопки в ряд.
//         [
//         Keyboard.callbackButton({
//             label: "Открыть приложение.",
//             payload: {
//                 appId: 7362610,
//                 userId: msg.userId
//             },
//             color: Keyboard.NEGATIVE_COLOR
//         })
//         ],
//         [
//         Keyboard.callbackButton({
//             label: "Показать сообщение.",
//             payload: {
//                 text: "Привет! Я исчезающее сообщение, и исчезну через 10 сек.",
//                 userId: msg.userId
//             },
//             color: Keyboard.SECONDARY_COLOR
//         })
//         ]
//     ]).inline()
// })

// });


updates.on('message_event', async (context) => {
    // Функции при событии "действие с сообщением".
    // Используется для работы с Callback-кнопками (подробнее на https://vk.com/dev/bots_docs_5).
    // Чтобы сделать определенное действие надо выполнить проверку, например:
    // if (context.eventPayload.command === "проверка") [...]
    if (context.eventPayload.command) return api.messages.edit({ peer_id: context.peerId, message: "Со мной всё впорядке, спасибо что позаботились обо мне! ☺", conversation_message_id: context.conversationMessageId }) // Редактирование сообщения.
    if (context.eventPayload.link) return api.messages.sendMessageEventAnswer({ event_id: context.eventId, user_id: context.userId, peer_id: context.peerId, event_data: JSON.stringify({ type: "open_link", link: context.eventPayload.link }) }) // Открытие ссылки.
    if (context.eventPayload.appId) return api.messages.sendMessageEventAnswer({ event_id: context.eventId, user_id: context.userId, peer_id: context.peerId, event_data: JSON.stringify({ type: "open_app", app_id: context.eventPayload.appId }) }) // Открытие приложения в ВКонтакте.
    if (context.eventPayload.text) return api.messages.sendMessageEventAnswer({ event_id: context.eventId, user_id: context.userId, peer_id: context.peerId, event_data: JSON.stringify({ type: "show_snackbar", text: context.eventPayload.text }) }) // Отображение сообщения в snackbar'е.
})

updates.on(['comment'], async (obj) => {
    if (obj.subTypes[1] === 'new_wall_comment') {
        let user = await users(obj.fromId);
        if (user == undefined) utils.regDateBase(obj.ownerId);

        if (obj.fromId != obj.ownerId) await vk.api.wall.createComment({
            owner_id: obj.ownerId,
            post_id: obj.objectId,
            reply_to_comment: obj.id,
            user_id: obj.fromId,
            message: `${comment_message[random(0, comment_message.length - 1)]}`
        });
        if (user.alert && !user.vip.access) {
            vk.api.messages.send({
                user_id: user.vk, message: `💌 Вам выдано +3 балла 🌟 \n\n За подаренную "любовь" Вам дадут +25 🌟\n\n 👩‍💻 Если Вам мешают уведомления, можно выключить их командой "уведомления"`, keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }]]
                })
            }).catch((error) => { throw error; });
            user.balance += 3;
            user.points += 3;
        }

        if (user.alert && user.vip.access) {
            vk.api.messages.send({
                user_id: user.vk, message: `💌 Вам выдано +5 балла 🌟 \n(действует VIP статус 💎)\n\n За подаренную "любовь" Вам дадут +50 🌟\n\n 👩‍💻 Если Вам мешают уведомления, можно выключить их командой "уведомления"`, keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }]
                    ]
                })
            }).catch((error) => { throw error; });
            user.balance += 5;
            user.points += 5;
        }

        if (obj.subTypes[2] === 'photo_comment_new') {
            let user = await users(obj.fromId);
            if (user.alert) vk.api.messages.send({
                user_id: user.vk, message: `💌 Вам выдано +3 🌟 \n За подаренную "любовь" Вам дадут +30 🌟\n\n 👩‍💻 Если Вам мешают уведомления, можно выключить их командой "уведомления"`, keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }]]
                })
            }).catch((error) => { throw error; });
            user.balance += 1;
            user.points += 1;

        }

        if (user.ref) {
            let id = await utils.vkId(user.ref),
                t = await users(id);
            t.balance += 2;
            if (t.alert) vk.api.messages.send({
                user_id: t.vk, message: `💌 Вам выдано +2 балла 🌟 за то, что Ваш [id${user.vk}|реферал] проявил активность\n\n 👩‍💻 Если Вам мешают уведомления, можно выключить их командой "уведомления"`, keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }]]
                })
            }).catch((error) => { throw error; });
        }

    }
});

updates.hear(/^(стата|stat[as]|📝 Стата)$/i, async (msg) => { // Информация о боте
    let smsg = ``;
    if (lpost === null) {
        await msg.send(`❌ Пост не обновлён, обновляю:`);
        await page.api.wall.get({ owner_id: -cgroup, count: 1, extended: 1, offset: 1 }).then(function (a) {
            lpost = a.items[0].id;
            lowner_id = [];
            lid = [];
            for (let i = 0; i < a.items[0].attachments.length; i++) {
                lowner_id.push(a.items[0].attachments[i].photo.owner_id);
                lid.push(a.items[0].attachments[i].photo.id);
            }
        })

        await msg.send(`Успешно обновлено ✅`);
    }
    smsg += `Количество баллов 🌟 за хорошую активность (на последнем посту меньше 20 ❤): 5O 🌟\n`
    smsg += `Количество баллов 🌟 за обычную активность (на последнем посту больше 20 ❤): 25 🌟\n\n`
    smsg += `💰 Цены за покупку в баллах: \n`
    smsg += `🏅 "Рандомное": ${random_price_bal} 🌟\n`
    smsg += `🥇 "Первое": ${first_price_bal} 🌟\n`
    smsg += `🏆 "Отдельное": ${apart_price_bal} 🌟\n\n`
    smsg += `💬 Среднее число лайков за последние 5 постов: ${average} ❤\n`
    smsg += `Исходя из этого числа составляется Price на покупку в баллах 🌟\n`
    smsg += `Анализ происходит каждую минуту, анализируются последние 5 постов 💭\n\n`


    return msg.send(`✏ Баллы за подаренную любовь Выдаются в данном посту: \nhttps://vk.com/wall-${cgroup}_${lpost} \n\n${smsg}`);
});

updates.hear(/^(🗯 Как ещё получить баллы)$/i, async (msg) => { // Информация о боте
    let smsg = ``;
    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [

                [{ "action": { "type": "text", "label": "📝 Стата" }, "color": "positive" }]
            ]
        })
    }

    smsg += `😵 Так же Вы можете перейти в другие группы-партнёров и заработать баллы там\n`
    smsg += `Список сообществ можно посмотреть здесь 👇🏻\n\n`
    smsg += `https://vk.com/topic-165367966_40832924`

    return msg.send(`✏ Узнать информацию о получение баллов Вы можете командой "стата"\n\n${smsg}`, keybo);
});

/*-------------------------------------------------------------------*/
/*     |                       
/*     |                   Команды      
/*     V                        
/*-------------------------------------------------------------------*/

updates.hear(/^(?:(Команды 📝|Меню 📝|команды|меню|начать))$/ig, async (msg) => {  // меню

    if (msg.isChat) return msg.answer(`список команд Выводится в личные сообщения с ботом ❗\n\n 👉🏻 Для перехода жмякай сюда - vk.me/bots_likes`);
    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            one_time: false,
            buttons: [

                [{ "action": { "type": "text", "label": "Автопокупка ♻" }, "color": "positive" }],

                [{ "action": { "type": "text", "label": "Лайк Тайм 💕" }, "color": "secondary" },
                { "action": { "type": "text", "label": "Фото батл 📸" }, "color": "secondary" }],

                [{ "action": { "type": "text", "label": "Пополнить 💵" }, "color": "secondary" }],

                [{ "action": { "type": "text", "label": "Профиль 🦋" }, "color": "secondary" },
                { "action": { "type": "text", "label": "Баланс 🌟" }, "color": "secondary" }],

                [{ "action": { "type": "text", "label": "🚀 Развлечение" }, "color": "secondary" }],

                [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "secondary" },
                { "action": { "type": "text", "label": "Реферал 👣" }, "color": "secondary" }],

                [{ "action": { "type": "text", "label": "🗯 Как ещё получить баллы" }, "color": "secondary" }],

                [{ "action": { "type": "open_app", "app_id": 7435620, "hash": "123", "label": `В чём особенность бота? 🤖` } }]
            ]
        })
    }

    return msg.answer(`💌 Доступные команды: `, keybo);
});

updates.hear(/^(?:(Автопокупка ♻|а[фв]т[ао]п[ао]ку[бп]ка))$/ig, async (msg) => {  // меню
    let keybo;
    if (msg.user.autobuy) {
        keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Автопокупка ♻" }, "color": "positive" }]
                ]
            })
        }
        msg.user.autobuy = false;
        return msg.answer(`Автопокупка отключена 🔕 \n Напишите ещё раз команду, если хотите включить! \n\nАвтопокупка позволяет автоматически покупать Вам "первое" лт, если у Вас есть баллы на него`, keybo);
    } else {
        keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Автопокупка ♻" }, "color": "negative" }]
                ]
            })
        }
        msg.user.autobuy = true;
        return msg.answer(`Автопокупка Включена 🔔\n Напишите ещё раз команду, если хотите выключить! \n\nАвтопокупка позволяет автоматически покупать Вам "первое" лт, если у Вас есть баллы на него`, keybo);
    }
});

updates.hear(/^(?:(Лайк Тайм 💕|лайк тайм|лт))$/ig, async (msg) => {  // меню

    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": "📙 История" }, "color": "secondary" },
                { "action": { "type": "text", "label": "🎎 Очередь" }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": "💒 Магазин" }, "color": "secondary" }]
            ]
        })
    }

    return msg.answer(`💌 Лайк Тайм 💕:`, keybo);
});

updates.hear(/^(?:(Фото батл 📸|фотобатл))$/ig, async (msg) => {  // меню
    let smsg = ``;

    smsg += `😻 Здесь Вы можете попасть в Photo Battle (к нам на стеночку)\n`
    smsg += `👉🏻 Ваше состояние: ${msg.user.balance} 🌟 и ${msg.user.rub}₽\n\n`
    smsg += `Фото батл стоит ${photobattle_bal} 🌟 или ${photobattle_rub}₽\n\n`
    smsg += `За какую валюту хотите купить?`
    msg.user.olink = photobattle;
    return msg.answer(`💌 Фото батл 📸: \n\n${smsg}`, rub_and_bal);
});

updates.hear(/^(?:(Фото батл 📸|фотобатл))$/ig, async (msg) => {  // меню
    let smsg = ``;

    smsg += `😻 Здесь Вы можете попасть в Photo Battle (к нам на стеночку)\n`
    smsg += `👉🏻 Ваше состояние: ${msg.user.balance} 🌟 и ${msg.user.rub}₽\n\n`
    smsg += `Фото батл стоит ${photobattle_bal} 🌟 или ${photobattle_rub}₽\n\n`
    smsg += `За какую валюту хотите купить?`
    msg.user.olink = photobattle;
    return msg.answer(`💌 Фото батл 📸: \n\n${smsg}`, rub_and_bal);
});

updates.hear(/^(?:(Баланс 🌟|баланс))$/ig, async (msg) => { // баланс
    let smsg = ``;
    let keybo;

    keybo = {
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": "Пополнить 💵" }, "color": "primary" },
                { "action": { "type": "text", "label": "💒 Магазин" }, "color": "negative" }],
                [{ "action": { "type": "text", "label": "♻ Обменник" }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": "Возможности VIP 💎" }, "color": "positive" }]
            ]
        })
    }

    if (msg.user.vip.access) smsg += `💎 VIP статус 💎\n\n`

    smsg += `[🌟] Баллов: ${utils.toCommas(Math.floor(msg.user.balance))} 🌟\n`
    smsg += `[💵] Рубли: ${utils.toCommas(Math.floor(msg.user.rub))}₽\n\n`
    smsg += `▬ Баллы и Рубли Вы можете потратить на покупку Лайк Тайма\n`
    smsg += `Это даёт 100% гарантию того, что Вы попадаёте к нам на стену\n\n`
    smsg += `🤑 За рубли Вас поднимает в самый вверх очереди (ждать не придётся)\n`
    smsg += `👀 Пополнить счёт можно командой "пополнить"\n\n`
    smsg += `▬ Для покупки Лайк Тайма перейдите в раздел "магазин"`

    return msg.answer(`💌 у Вас имеется: \n\n${smsg}`, keybo);
});

updates.hear(/^(?:(красивая))/ig, async (msg) => {
    if (msg.isChat) return;
    if (!msg.user.admin) return msg.send(`❌ у Вас нет прав на эту команду`);

    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await users(id);

    if (!msg.params_org[0]) return msg.answer(`❌ Вы не указали ID человека`);
    if (t.error || !id) return msg.answer(`❌ Человек не найден, возможно не зарегистрирован`);

    const user = await vk.api.users.get({ user_ids: t.vk, fields: "photo_id" });
    const avatar = user[0].photo_id;

    await page.api.polls.create({
        owner_id: -cgroup,
        question: "красивая ?",
        add_answers: JSON.stringify(["да 😍", "нет 🤢", "50/50 👉🏼👈🏼"])
    }).then(async function (a) {
        await page.api.wall.post({
            owner_id: -cgroup,
            message: `${post_message[random(0, post_message.length - 1)]}`,
            attachments: `poll144793398_${a.id}, photo${avatar}`,
        }).then(function (a) {
            vk.api.messages.send({
                user_id: Number(t.vk),
                random_id: 0,
                message: `🌈 Редактор ${msg.name} опубликовал "Фото Батл" с Вами на стеночке ✅\n 👉🏻 https://vk.com/wall-${cgroup}_${a.post_id}`
            });
            return msg.answer(`Вы успешно создали новый пост "красивая" ✅\n 👉🏻 https://vk.com/wall-${cgroup}_${a.post_id}`);
        })
    })
});

updates.hear(/^(?:(оценка))/ig, async (msg) => {
    if (msg.isChat) return;
    if (!msg.user.admin) return msg.send(`❌ у Вас нет прав на эту команду`);

    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await users(id);

    if (!msg.params_org[0]) return msg.answer(`❌ Вы не указали ID человека`);
    if (t.error || !id) return msg.answer(`❌ Человек не найден, возможно не зарегистрирован`);

    const user = await vk.api.users.get({ user_ids: t.vk, fields: "photo_id" });
    const avatar = user[0].photo_id;

    await page.api.polls.create({
        owner_id: -cgroup,
        question: "оценка 🥰",
        add_answers: JSON.stringify(["1/5 🍒", "2/5 🍒", "3/5 🍒", "4/5 🍒", "5/5 🍒"])
    }).then(async function (a) {
        await page.api.wall.post({
            owner_id: -cgroup,
            message: `${post_message[random(0, post_message.length - 1)]}`,
            attachments: `poll144793398_${a.id}, photo${avatar}`,
        }).then(function (a) {
            vk.api.messages.send({
                user_id: Number(t.vk),
                random_id: 0,
                message: `🌈 Редактор ${msg.name} опубликовал "Фото Батл" с Вами на стеночке ✅\n 👉🏻 https://vk.com/wall-${cgroup}_${a.post_id}`
            });
            return msg.answer(`Вы успешно создали новый пост "оценка" ✅\n 👉🏻 https://vk.com/wall-${cgroup}_${a.post_id}`);
        })
    })
});

updates.hear(/^(?:(встречался|встреча))/ig, async (msg) => {
    if (msg.isChat) return;
    if (!msg.user.admin) return msg.send(`❌ у Вас нет прав на эту команду`);

    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await users(id);

    if (!msg.params_org[0]) return msg.answer(`❌ Вы не указали ID человека`);
    if (t.error || !id) return msg.answer(`❌ Человек не найден, возможно не зарегистрирован`);

    const user = await vk.api.users.get({ user_ids: t.vk, fields: "photo_id" });
    const avatar = user[0].photo_id;

    await page.api.polls.create({
        owner_id: -cgroup,
        question: "встречался(ась) бы ?",
        add_answers: JSON.stringify(["конечно 🤩", "свой/своя есть 😏", "50/50 🤓", "нет 🤨"])
    }).then(async function (a) {
        await page.api.wall.post({
            owner_id: -cgroup,
            message: `${post_message[random(0, post_message.length - 1)]}`,
            attachments: `poll144793398_${a.id}, photo${avatar}`,
        }).then(function (a) {
            vk.api.messages.send({
                user_id: Number(t.vk),
                random_id: 0,
                message: `🌈 Редактор ${msg.name} опубликовал "Фото Батл" с Вами на стеночке ✅\n 👉🏻 https://vk.com/wall-${cgroup}_${a.post_id}`
            });
            return msg.answer(`Вы успешно создали новый пост "встреча" ✅\n 👉🏻 https://vk.com/wall-${cgroup}_${a.post_id}`);
        })
    })
});

updates.hear(/^(Профиль 🦋|профиль|проф)$/ig, async (msg) => {
    await msg.answer(`Секунду, составляем для Вас профиль`);
    // переменные:
    const Canvas = require('canvas');
    const Image = Canvas.Image;
    const ctxx = canvas.getContext('2d');
    const img = new Image();
    const stats = new Image();

    img.src = './modules/profile/profile.png';
    stats.src = './modules/profile/stats.png';

    const [IUser] = await vk.api.users.get({ user_ids: msg.senderId });
    const [userq] = await vk.api.users.get({ user_ids: msg.user.vk, fields: "photo_400_orig" });
    let user = Number(msg.user.vk);
    let dateNow = new Date();
    const mychit = await loadImage(userq.photo_400_orig);
    const vip = await loadImage(`./modules/profile/vip.png`);
    const crown = await loadImage(`./modules/profile/crown.png`);

    let turn = "Нет";
    let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&page=search_queue_lt&photo=https://vk.com/id' + user + '&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh'
    request(link, function (error, response, body) {
        if (error) {
            vk.api.messages.send({
                user_id: msg.senderId,
                random_id: 0,
                message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                })
            })
        }
        let number = JSON.parse(body);
        if (number.turn == "null") return;
        turn = number.turn;
    });

    let alert = "Включены";
    if (!msg.user.alert) alert = "Выключены";

    let end_vip = msg.user.vip.time - Date.now(); // Формула которая считает конец времени VIP
    if (end_vip < 0) end_vip = "VIP статус отсутствует";

    // создание картинок
    ctxx.drawImage(mychit, 0, 0);
    ctxx.drawImage(img, 0, 0);
    if (msg.user.vip.access) ctxx.drawImage(vip, 400, -60);
    if (msg.user.vip.access) ctxx.drawImage(crown, 70, -190);

    const { registerFont } = require('canvas');
    registerFont('./modules/profile/fonts/9651.ttf', { family: 'Regular' });

    ctxx.font = '40px Regular';
    ctxx.fillStyle = '#ff2400';
    strokeStyle = '#ff2400'

    ctxx.fillText(`${IUser.first_name}`, 130, 387);
    ctxx.fillText(`${IUser.last_name}`, 110, 425);
    ctxx.fillText(`${msg.senderId}`, 530, 155);
    ctxx.fillText(`${msg.user.balance}`, 625, 219);
    ctxx.fillText(`${msg.user.rub} ₽`, 620, 279);
    ctxx.fillText(`${dateNow.toLocaleDateString()}`, 580, 345);

    let attachment = await msg.vk.upload.messagePhoto({ source: canvas.toBuffer() });
    await msg.send({ attachment })

    ctxx.drawImage(stats, 0, 0);
    if (msg.user.vip.access) ctxx.fillText(`${unixStampLeft(end_vip)}`, 440, 75);
    if (!msg.user.vip.access) ctxx.fillText(`${end_vip}`, 440, 75);
    ctxx.fillText(`${msg.user.referrals} чел.`, 440, 137);
    ctxx.fillText(`${msg.user.cmd} раз`, 480, 205);
    ctxx.fillText(`${turn}`, 400, 265);
    ctxx.fillText(`${alert}`, 455, 335);
    ctxx.fillText(`${msg.user.points} баллов`, 550, 400);
    attachment = await msg.vk.upload.messagePhoto({ source: canvas.toBuffer() });
    return msg.send({ attachment })
});


/*-------------------------------------------------------------------*/
/*     |                       
/*     |                   Магазин лайк тайма   
/*     V                        
/*-------------------------------------------------------------------*/

updates.hear(/^(?:(💒 Магазин|магаз|магазин))$/ig, async (msg) => {
    let smsg = ``;

    smsg += `😻 Здесь Вы можете попасть в LikeTime (к нам на стеночку)\n`
    smsg += `👉🏻 Ваше состояние: ${msg.user.balance} 🌟 и ${msg.user.rub}₽\n\n`
    smsg += `🚀 Какой Лайк Тайм желаете получить? \n\n`

    let time = msg.user.shoptime - Date.now(); // Формула которая считает конец времени VIP

    if (time <= 1) {
        let [IUser] = await vk.api.users.get({ user_ids: msg.senderId });
        let user = Number(msg.user.vk); // Человек
        if (IUser.is_closed == true) return msg.answer(`❌ Ваша страница закрыта! Просьба открыть её и повторить попытку.. \n\n Как же люди будут ставить Вам ❤ , если Ваша страничка для них закрыта?`); // Если закрыта страничка
        let links = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&page=search_queue_lt&photo=https://vk.com/id' + user + '&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh'
        request(links, async function (error, response, body) {
            if (error) {
                vk.api.messages.send({
                    user_id: msg.senderId,
                    random_id: 0,
                    message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                    })
                })
            }
            let number = JSON.parse(body);
            // Проверки:
            if (number.turn != "null") {
                msg.user.olink = 0;
                return msg.answer(`❌ Вы уже состоите в очереди и не можете купить себе услугу, дождитесь пока Вас опубликуют и попробуйте купить заново \n Вы в очереди под номером: <<${number.turn}>>`); // Если человек уже в ЛТ 
            }

            if (number.count > 10 && !msg.user.vip.access) {
                msg.user.olink = 0;
                return msg.answer(`❌ На данный момент очередь в магазине слишком большая (${number.count}) \n\n Попробуйте повторить попытку позже ✅ \n Или купите себе VIP статус, лимит отсутствует 👻`, buy_vip_keyboard);
            }

        })

        let keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Рандомный 🏅" }, "color": "secondary" }],
                    [{ "action": { "type": "text", "label": "Первый 🥇" }, "color": "secondary" }],
                    [{ "action": { "type": "text", "label": "Отдельный 🏆" }, "color": "secondary" }],
                    [{ "action": { "type": "text", "label": "Закреплённый 😎" }, "color": "secondary" }]
                ]
            })
        }

        return msg.answer(`раздел покупки Лайк Тайма 💌: \n\n${smsg}`, keybo);
    } else return msg.answer(`❌ Покупать услуги в магазине можно раз в 12 часов \n💎 Для VIP игроков и за покупку в рублях ограничения нет 💎\n\n 💦 У [id${msg.user.vk}|Вас] время ещё не прошло \n ⌛ Осталось: ${unixStampLeft(time)}`);

});

updates.hear(/^(?:(Рандомный 🏅|рандомн[ыйое]))$/ig, async (msg) => {
    let smsg = ``;

    smsg += `▬ 🏅 "Рандомное" - покупка Лайк Тайма в перемешку с другими фото\n`
    smsg += `⚠ Ваша фотография будет размещена в позиции 2-5 (не первая)\n`
    smsg += `💰 Стоимость: ${random_price_bal} баллов 🌟 или ${random_price_rub}₽\n`
    smsg += `📢 Покупая за Рубли Вы попадете ВНЕ ОЧЕРЕДИ 📢\n\n`
    if (msg.user.balance >= random_price_bal) smsg += `✅ Вам хватает баллов на покупку этой услуги\n`
    if (msg.user.balance < random_price_bal) smsg += `‼ Вам не хватает баллов на покупку этой услуги ‼\n`
    if (msg.user.rub >= random_price_rub) smsg += `✅ Вам хватает рублей на покупку этой услуги\n`
    if (msg.user.rub < random_price_rub) smsg += `‼ Вам не хватает рублей на покупку этой услуги ‼\n`
    if (msg.user.rub < random_price_rub && msg.user.balance < random_price_bal) {
        smsg += `⚠ Советуем Вам поднакопить баллов или пополнить счёт ⚠`
        return msg.answer(`информация о Рандомном 🏅:\n\n${smsg}`, donate_keyboard);
    } else {
        smsg += `\n🆘 За какую валюту Вы хотите купить "рандомное" попадание в Лайк Тайм? 💋`
        msg.user.olink = mixed;
    }
    return msg.answer(`информация о Рандомном 🏅:\n\n${smsg}`, rub_and_bal);
});

updates.hear(/^(?:(Первый 🥇|перв[ыйое]))$/ig, async (msg) => {
    let smsg = ``;

    smsg += `▬ 🥇 "Первое" - покупка Лайк Тайма в перемешку с другими фото\n`
    smsg += `⚠ Ваша фотография будет размещена в первой позиции\n`
    smsg += `💰 Стоимость: ${first_price_bal} баллов 🌟 или ${first_price_rub}₽\n\n`
    smsg += `📢 Покупая за Рубли Вы попадете ВНЕ ОЧЕРЕДИ 📢\n\n`
    if (msg.user.balance >= first_price_bal) smsg += `✅ Вам хватает баллов на покупку этой услуги\n`
    if (msg.user.balance < first_price_bal) smsg += `‼ Вам не хватает баллов на покупку этой услуги ‼\n`
    if (msg.user.rub >= first_price_rub) smsg += `✅ Вам хватает рублей на покупку этой услуги\n`
    if (msg.user.rub < first_price_rub) smsg += `‼ Вам не хватает рублей на покупку этой услуги ‼\n`
    if (msg.user.rub < first_price_rub && msg.user.balance < first_price_bal) {
        smsg += `⚠ Советуем Вам поднакопить баллов или пополнить счёт ⚠`
        return msg.answer(`информация о Первое 🥇:\n\n${smsg}`, donate_keyboard);
    } else {
        smsg += `\n🆘 За какую валюту Вы хотите купить "первое" попадание в Лайк Тайм? 💋`
        msg.user.olink = first;
    }
    return msg.answer(`информация о Первое 🥇:\n\n${smsg}`, rub_and_bal);
});

updates.hear(/^(?:(Отдельный 🏆|отдель[ыйое]))$/ig, async (msg) => {
    let smsg = ``;

    smsg += `▬ 🏆 "Отдельное" - покупка Лайк Тайма отдельным постом\n`
    smsg += `⚠ Ваша фотография будет одна единственная в посте\n`
    smsg += `💰 Стоимость: ${apart_price_bal} баллов 🌟 или ${apart_price_rub}₽\n\n`
    smsg += `📢 Покупая за Рубли Вы попадете ВНЕ ОЧЕРЕДИ 📢\n\n`
    if (msg.user.balance >= apart_price_bal) smsg += `✅ Вам хватает баллов на покупку этой услуги\n`
    if (msg.user.balance < apart_price_bal) smsg += `‼ Вам не хватает баллов на покупку этой услуги ‼\n`
    if (msg.user.rub >= apart_price_rub) smsg += `✅ Вам хватает рублей на покупку этой услуги\n`
    if (msg.user.rub < apart_price_rub) smsg += `‼ Вам не хватает рублей на покупку этой услуги ‼\n`
    if (msg.user.rub < apart_price_rub && msg.user.balance < apart_price_bal) {
        smsg += `⚠ Советуем Вам поднакопить баллов или пополнить счёт ⚠`
        return msg.answer(`информация о Отдельное 🏆:\n\n${smsg}`, donate_keyboard);
    } else {
        smsg += `\n🆘 За какую валюту Вы хотите купить "Отдельное" попадание в Лайк Тайм? 💋`
        msg.user.olink = apart;
    }
    return msg.answer(`информация о Отдельное 🏆:\n\n${smsg}`, rub_and_bal);
});

updates.hear(/^(?:(Закреплённый 😎|закреп))$/ig, async (msg) => {
    let smsg = ``;
    let [IUser] = await vk.api.users.get({ user_ids: msg.senderId });
    if (IUser.is_closed == true) return msg.answer(`❌ Ваша страница закрыта! Просьба открыть её и повторить попытку..`); // Если закрыта страничка
    let report = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "positive" }]
            ]
        })
    }

    if (msg.user.rub >= securing) {
        msg.user.rub -= securing
        await vk.api.messages.send({
            chat_id: 14,
            random_id: 0,
            message: `❗ ВНИМАНИЕ ❗\n\n ➡ Человек ${msg.name} купил услугу "Закреп 24 часа"`
        })
        return msg.answer(`Вы успешно купили услугу "Закреп на 24 часа" за ${securing} руб. \n\n В течении суток администратор обработает Ваш заказ ✅\n\n Если Вы случайно купили и хотите отменить заказ; или же хотите связаться с администратором по другому вопросу, обратитесь в репорт 🆘`, report);
    } else {
        smsg += `▬ 😎 "Закрепленный" - покупка Лайк Тайма отдельным постом\n`
        smsg += `😇 Ваш отдельный пост будет закреплён на 24 часа\n`
        smsg += `⚠ Ваша фотография будет одна единственная в посте\n`
        smsg += `💰 Стоимость: ${securing}₽\n\n`
        smsg += `🤕 Это услуга, которая обслуживается администрацией..\n`

        return msg.answer(`информация о Закреплённый 😎:\n\n${smsg} \n Пополните счёт и повторите попытку для того, что бы купить. Ваших рублей (${msg.user.rub}) не хватает 🤐`, donate_keyboard);
    }
});

updates.hear(/^(?:(Рубли ₽|рубли))$/ig, async (msg) => {
    if (msg.user.olink == 0) return msg.answer(`❌ Что значит "🌟 Баллы"?) Перейдите в раздел магазина, Выберите что хотите купить и повторите попытку \n Бот Вас не понимает`);
    // Обменник:
    if (msg.user.olink === change) {
        if (!msg.user.rub) {
            return msg.answer(`❌ у Вас нет рублей для обмена`, donate_keyboard);
        }

        msg.user.olink = change_rub;
        return msg.answer(`😼 Сколько рублей Вы хотите обменять? \nВам доступно ${msg.user.rub}₽ \n\n(введите число ниже)`)
    }
    // Переменные:
    let user = Number(msg.user.vk); // Человек

    // Проверки:
    if (msg.user.olink > 0) await msg.answer(`💭 Обрабатываем Ваш запрос, пожалуйста, подождите ✅`);


    // Действия:

    // Рандомное за рубли:
    if (msg.user.olink === mixed) {
        if (msg.user.rub < random_price_rub) {
            return msg.answer(`❌ У Вас недостаточно средств, для покупки этой услуги`, donate_keyboard);
        }
        let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&preference=1&page=new_queue_lt&photo=https://vk.com/id' + user + '&position=1&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh';
        request(link, function (error, response, body) {
            let data = JSON.parse(body);
            if (error) {
                vk.api.messages.send({
                    user_id: msg.senderId,
                    random_id: 0,
                    message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                    })
                })
            }
        });

        msg.user.rub -= random_price_rub;
        return msg.answer(`✅ Вы успешно добавили себя в очередь за ${random_price_rub}₽ \n\n‼ Ваша фотография будет рандомной в посту 👇🏻\n\n Так как Вы купили ЛТ за Рубли, у Вас Выше приоритет скорости Выхода поста 🌟`);
    }

    // Первое за рубли
    if (msg.user.olink === first) {
        if (msg.user.rub < first_price_rub) {
            return msg.answer(`❌ У Вас недостаточно средств, для покупки этой услуги`, donate_keyboard);
        }
        let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&preference=1&page=new_queue_lt&photo=https://vk.com/id' + user + '&position=0&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh';
        request(link, function (error, response, body) {
            let data = JSON.parse(body);
            if (error) {
                vk.api.messages.send({
                    user_id: msg.senderId,
                    random_id: 0,
                    message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                    })
                })
            }
        });
        msg.user.rub -= first_price_rub;
        vk.api.messages.send({
            chat_id: 14,
            random_id: 0,
            message: `❗ ВНИМАНИЕ ❗\n\n ➡ Человек ${msg.name} купил за рубли "Первое" лт`
        })
        return msg.answer(`✅ Вы успешно добавили себя в очередь за ${first_price_rub}₽ \n\n‼ Ваша фотография будет первой в посту 👇🏻\n\n Так как Вы купили ЛТ за Рубли, у Вас Выше приоритет скорости Выхода поста 🌟`);
    }

    if (msg.user.olink === apart) {
        if (msg.user.rub < apart_price_rub) {
            return msg.answer(`❌ У Вас недостаточно средств, для покупки этой услуги`, donate_keyboard);
        }
        let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&preference=1&page=new_queue_lt&photo=https://vk.com/id' + user + '&position=2&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh';
        request(link, function (error, response, body) {
            let data = JSON.parse(body);
            if (error) {
                vk.api.messages.send({
                    user_id: msg.senderId,
                    random_id: 0,
                    message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                    })
                })
            }
        });
        msg.user.rub -= apart_price_rub;
        vk.api.messages.send({
            chat_id: 14,
            random_id: 0,
            message: `❗ ВНИМАНИЕ ❗\n\n ➡ Человек ${msg.name} купил за рубли "Отдельное" лт`
        })
        return msg.answer(`✅ Вы успешно добавили себя в очередь за ${apart_price_rub}₽ \n\n‼ Ваша фотография будет отдельной в посту 👇🏻\n\n Так как Вы купили ЛТ за Рубли, у Вас Выше приоритет скорости Выхода поста 🌟`);
    }

    if (msg.user.olink === photobattle) {

        if (msg.user.store > 0) return msg.answer(`❌ Вы уже купили фотобатл, ожидайте пока его одобрят или отклонят`)
        if (msg.user.rub < photobattle_rub) return msg.answer(`❌ у Вас не хватает рублей на покупку этой услуги!`, donate_keyboard);
        msg.user.rub -= photobattle_rub;
        vk.api.messages.send({
            user_id: 144793398,
            random_id: 0,
            message: `❗ ВНИМАНИЕ ❗\n\n ➡ Человек ${msg.name} купил за рубли "Фото батл" \n\n Выберите один из вариантов для публикации поста 👇🏻`, keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": `красивая ${msg.user.vk}` }, "color": "secondary" },
                    { "action": { "type": "text", "label": `возраст ${msg.user.vk}` }, "color": "secondary" }],
                    [{ "action": { "type": "text", "label": `встреча ${msg.user.vk}` }, "color": "secondary" },
                    { "action": { "type": "text", "label": `оценка ${msg.user.vk}` }, "color": "secondary" }],
                    [{ "action": { "type": "text", "label": `отказ ${msg.user.vk}` }, "color": "negative" }],
                ]
            })
        })
        return msg.answer(`😻 Спасибо за покупку! В скором времени администрация [id${msg.user.vk}|Вас] добавит в Фото батл ✅`)
    }
});

updates.hear(/^(?:(👉🏻 Отправить заявку ещё раз))$/ig, async (msg) => {
    vk.api.messages.send({
        chat_id: 24,
        random_id: 0,
        message: `❗ ВНИМАНИЕ ❗\n\n ➡ Человек ${msg.name} купил "Фото батл" \n\n Выберите один из вариантов для публикации поста 👇🏻`, keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": `красивая ${msg.user.vk}` }, "color": "secondary" },
                { "action": { "type": "text", "label": `возраст ${msg.user.vk}` }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": `встреча ${msg.user.vk}` }, "color": "secondary" },
                { "action": { "type": "text", "label": `оценка ${msg.user.vk}` }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": `отказ ${msg.user.vk}` }, "color": "negative" }],
            ]
        })
    })

    return msg.answer(`Отправили заявку ещё раз! \n Ожидайте`);
});

updates.hear(/^(?:(⛔ Отменить фотобатл))$/ig, async (msg) => {
    if (!msg.user.store) return msg.answer(`Вы не покупали фотобатл`);
    vk.api.messages.send({
        user_id: 144793398,
        random_id: 0,
        message: `❗ ВНИМАНИЕ ❗\n\n ➡ Человек ${msg.name} отменил фотобатл`
    })

    msg.user.balance += store;
    msg.user.store = 0;
    return msg.answer(`Вы отменили фотобатл, Ваши баллы к Вам вернулись`);
});

updates.hear(/^(?:(🌟 Баллы|баллы))$/ig, async (msg) => {
    if (msg.user.olink == 0) return msg.answer(`❌ Что значит "🌟 Баллы"?) Перейдите в раздел магазина, Выберите что хотите купить и повторите попытку \n Бот Вас не понимает`);

    if (msg.user.olink === change) {
        msg.user.olink = 0;
        if (!msg.user.balance) {
            return msg.answer(`❌ у Вас нет баллов для обмена`, donate_keyboard);
        }

        if (msg.user.balance < buy_rub) {
            return msg.answer(`❌ у Вас слишком мало баллов для обмена`, donate_keyboard);
        }

        msg.user.olink = change_balance;
        return msg.answer(`😼 Сколько баллов Вы хотите обменять? \nВам доступно ${msg.user.balance}🌟 \n\n(введите число ниже)`)
    }


    // Действия:
    if (msg.user.olink > 0) await msg.answer(`💭 Обрабатываем Ваш запрос, пожалуйста, подождите ✅`);
    let user = Number(msg.user.vk); // Человек

    // Рандомное за баллы:
    if (msg.user.olink === mixed) {
        msg.user.olink = 0;
        // Переменные:
        let links = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&page=search_queue_lt&photo=https://vk.com/id' + user + '&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh'
        request(links, async function (error, response, body) {
            if (error) {
                vk.api.messages.send({
                    user_id: msg.senderId,
                    random_id: 0,
                    message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                    })
                })
            }
            let number = JSON.parse(body);
            // Проверки:
            if (number.turn != "null") return msg.answer(`❌ Вы уже состоите в очереди, дождитесь пока Вас опубликуют и повторите попытку \n Вы в очереди под номером: <<${number.turn}>>`); // Если человек уже в ЛТ 

            if (number.count > 10 && !msg.user.vip.access) {
                msg.user.olink = 0;
                return msg.answer(`❌ На данный момент очередь в магазине слишком большая (${number.count}) \n\n Попробуйте повторить попытку позже ✅ \n Или купите себе VIP статус, лимит отсутствует 👻`, buy_vip_keyboard);
            }

            if (msg.user.balance < random_price_bal) {
                return msg.answer(`❌ У Вас недостаточно средств, для покупки этой услуги`, donate_keyboard);
            }

            let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&preference=0&page=new_queue_lt&photo=https://vk.com/id' + user + '&position=1&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh';
            request(link, function (error, response, body) {
                if (error) {
                    vk.api.messages.send({
                        user_id: msg.senderId,
                        random_id: 0,
                        message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                            inline: true,
                            buttons: [
                                [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                        })
                    })
                }
                let data = JSON.parse(body);
            });
            msg.user.balance -= random_price_bal;
            if (!msg.user.vip.access) { msg.user.shoptime = getUnix() + purchase_time };
            return msg.answer(`✅ Вы успешно добавили себя в очередь за ${random_price_bal} баллов 🌟\n\n‼ Ваша фотография будет рандомной в посту ‼`);
        })
    }

    // Первое за баллы
    if (msg.user.olink === first) {
        msg.user.olink = 0;
        let links = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&page=search_queue_lt&photo=https://vk.com/id' + user + '&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh'
        request(links, async function (error, response, body) {
            let number = JSON.parse(body);
            // Проверки:
            if (number.turn != "null") return msg.answer(`❌ Вы уже состоите в очереди, дождитесь пока Вас опубликуют и повторите попытку \n Вы в очереди под номером: <<${number.turn}>>`); // Если человек уже в ЛТ 
            if (number.count > 10 && !msg.user.vip.access) {
                msg.user.olink = 0;
                return msg.answer(`❌ На данный момент очередь в магазине слишком большая (${number.count}) \n\n Попробуйте повторить попытку позже ✅ \n Или купите себе VIP статус, лимит отсутствует 👻`, buy_vip_keyboard);
            }
        })
        if (msg.user.balance < first_price_bal) {
            return msg.answer(`❌ У Вас недостаточно средств, для покупки этой услуги`, donate_keyboard);
        }

        await msg.answer(`✅ Вы успешно добавили себя в очередь за ${first_price_bal} баллов 🌟\n\n‼ Ваша фотография будет первая в посту ‼`);
        let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&preference=0&page=new_queue_lt&photo=https://vk.com/id' + user + '&position=0&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh';
        request(link, function (error, response, body) {
            if (error) {
                vk.api.messages.send({
                    user_id: msg.senderId,
                    random_id: 0,
                    message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                    })
                })
            }
            let data = JSON.parse(body);
        });
        msg.user.balance -= first_price_bal;
        if (!msg.user.vip.access) { msg.user.shoptime = getUnix() + purchase_time };
        vk.api.messages.send({
            chat_id: 505,
            random_id: 0,
            message: `🌟 ВНИМАНИЕ 🌟\n\n ➡ Человек ${msg.name} купил себе "Первое" лт за баллы 🌟 в сообществе: @club${cgroup}`
        })
    }

    if (msg.user.olink === apart) {
        msg.user.olink = 0;
        let links = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&page=search_queue_lt&photo=https://vk.com/id' + user + '&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh'
        request(links, async function (error, response, body) {
            if (error) {
                vk.api.messages.send({
                    user_id: msg.senderId,
                    random_id: 0,
                    message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                    })
                })
            }
            let number = JSON.parse(body);
            // Проверки:
            if (number.turn != "null") return msg.answer(`❌ Вы уже состоите в очереди, дождитесь пока Вас опубликуют и повторите попытку \n Вы в очереди под номером: <<${number.turn}>>`); // Если человек уже в ЛТ 
            if (number.count > 10 && !msg.user.vip.access) {
                msg.user.olink = 0;
                return msg.answer(`❌ На данный момент очередь в магазине слишком большая (${number.count}) \n\n Попробуйте повторить попытку позже ✅ \n Или купите себе VIP статус, лимит отсутствует 👻`, buy_vip_keyboard);
            }
        })
        if (msg.user.balance < apart_price_bal) {
            return msg.answer(`❌ У Вас недостаточно средств, для покупки этой услуги`, donate_keyboard);
        }
        let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&preference=2&page=new_queue_lt&photo=https://vk.com/id' + user + '&position=2&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh';
        request(link, function (error, response, body) {
            let data = JSON.parse(body);
        });
        msg.user.balance -= apart_price_bal;
        if (!msg.user.vip.access) { msg.user.shoptime = getUnix() + purchase_time };
        return msg.answer(`✅ Вы успешно добавили себя в очередь за ${apart_price_bal} баллов 🌟\n\n‼ Ваша фотография будет отдельная в посту ‼`);
    }
    if (msg.user.olink === photobattle) {

        if (msg.user.balance < photobattle_bal) return msg.answer(`у Вас не хватает баллов на покупку этой услуги!`, donate_keyboard);
        if (msg.user.store > 0) {
            let keybo = {
                disable_mentions: 1,
                keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": `👉🏻 Отправить заявку ещё раз` }, "color": "positive" }]
                        [{ "action": { "type": "text", "label": `⛔ Отменить фотобатл` }, "color": "negative" }]
                    ]
                })
            }
            return msg.answer(`❌ Вы уже купили фотобатл, ожидайте пока его одобрят или отклонят`, keybo)
        }
        msg.user.balance -= photobattle_bal;
        msg.user.store += photobattle_bal;
        if (!msg.user.vip.access) { msg.user.shoptime = getUnix() + purchase_time };
        vk.api.messages.send({
            user_id: 144793398,
            random_id: 0,
            message: `❗ ВНИМАНИЕ ❗\n\n ➡ Человек ${msg.name} купил за баллы "Фото батл" \n\n Выберите один из вариантов для публикации поста 👇🏻`, keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": `красивая ${msg.user.vk}` }, "color": "secondary" },
                    { "action": { "type": "text", "label": `возраст ${msg.user.vk}` }, "color": "secondary" }],
                    [{ "action": { "type": "text", "label": `встреча ${msg.user.vk}` }, "color": "secondary" },
                    { "action": { "type": "text", "label": `оценка ${msg.user.vk}` }, "color": "secondary" }],
                    [{ "action": { "type": "text", "label": `отказ ${msg.user.vk}` }, "color": "negative" }],
                ]
            })
        })
        await msg.answer(`😻 Спасибо за покупку! В скором времени администрация [id${msg.user.vk}|Вас] добавит в Фото батл ✅`)

    }

    return msg.answer(`😻 Спасибо за покупку! В скором времени [id${msg.user.vk}|Вы] будете у нас на стеночке ✅`);
});

updates.hear(/^(?:(Рулетка 🎰|рулетка|🐒|🍌|🍋|🍒|🍇))$/ig, async (msg) => {

    let smsg = ``;
    let smile = ["🙀", "😻", "😎", "😱", "😳", "🤑", "🤩"];
    let disorder = ["🙄", "😬", "🤐", "🤔", "😧", "😨"];
    let time = msg.user.roulette - Date.now(); // Формула которая считает конец времени VIP

    // Рандомайзер
    let rand = random(1, 100)
    let rand_ball = random(20, 80);
    let rand_rub = random(1, 5);

    let key1 = tape[random(0, tape.length - 1)];
    let key2 = tape[random(0, tape.length - 1)];
    let key3 = tape[random(0, tape.length - 1)];
    let key4 = tape[random(0, tape.length - 1)];
    let key5 = tape[random(0, tape.length - 1)];
    let key6 = tape[random(0, tape.length - 1)];
    let key7 = tape[random(0, tape.length - 1)];
    let key8 = tape[random(0, tape.length - 1)];
    let key9 = tape[random(0, tape.length - 1)];
    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }]
            ]
        })
    }

    if (time <= 1) {
        if (!msg.user.vip.access) { msg.user.roulette = getUnix() + 3600000; }
        if (msg.user.vip.access) { msg.user.roulette = getUnix() + 1800000; }
        if (key1 == key4 && key4 == key7 || key1 == key2 && key2 == key3 || key1 == key5 && key5 == key9 || key2 == key5 && key5 == key8 || key3 == key6 && key6 == key9 || key3 == key5 && key5 == key7 || key4 == key5 && key5 == key6 || key7 == key8 && key8 == key9) {
            if (key1 == key4 & key4 == key7) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }]
                        ]
                    })
                }
            }

            if (key1 == key2 & key2 == key3) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key2}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key3}` }, "color": "negative" }],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }]
                        ]
                    })
                }
            }

            if (key1 == key5 & key5 == key9) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key5}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key9}` }, "color": "negative" }]
                        ]
                    })
                }
            }

            if (key2 == key5 & key5 == key8) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key2}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key5}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key8}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }]
                        ]
                    })
                }
            }

            if (key3 == key6 & key6 == key9) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key3}` }, "color": "negative" }],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key6}` }, "color": "negative" }],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key9}` }, "color": "negative" }]
                        ]
                    })
                }
            }

            if (key3 == key5 & key5 == key7) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key3}` }, "color": "negative" }],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key5}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }]
                        ]
                    })
                }
            }

            if (key4 == key5 & key5 == key6) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key5}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key6}` }, "color": "negative" }],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }]
                        ]
                    })
                }
            }

            if (key7 == key8 & key8 == key9) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                            { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key8}` }, "color": "negative" },
                            { "action": { "type": "text", "label": `${key9}` }, "color": "negative" }]
                        ]
                    })
                }
            }


            smsg += `Сорвали ДЖЕКПОТ ${smile[random(0, smile.length - 1)]} \n`;
            if (rand <= 80) {
                smsg += `+ ${rand_ball} баллов 🌟`
                msg.user.balance += parseFloat(rand_ball);
                msg.user.points += parseFloat(rand_ball);
            }
            if (rand > 80) {
                smsg += `+ ${rand_rub} рублей ₽`
                msg.user.rub += parseFloat(rand_rub);
            }
        } else {
            smsg += `Ничего не Выиграли ${disorder[random(0, disorder.length - 1)]} \n Не расстраивайтесь, попробуйте позже ⌛`
        }

        await msg.send(`👇🏻 Рулетка 👇🏻`, keybo);
        return msg.answer(`🎰 Вы прокрутили рулетку и \n${smsg}`)
    } else return msg.answer(`❌ Крутить рулетку можно раз в час \n💎 Для VIP игроков раз в пол часа 💎\n\n 💦 У [id${msg.user.vk}|Вас] время ещё не прошло \n ⌛ Осталось: ${unixStampLeft(time)}`);
});


updates.hear(/^(?:(Сундук 📦|сундук|сундуч[ое]к))$/ig, async (msg) => {
    let smsg = ``;
    let ball = Number(msg.user.balance);
    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": `${ball}` }, "color": "positive" }]
            ]
        })
    }

    let chests = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": "👇🏻Вот" }, "color": "negative" },
                { "action": { "type": "text", "label": "👇🏻Этот" }, "color": "negative" },
                { "action": { "type": "text", "label": "👇🏻Тут" }, "color": "negative" }]
            ]
        })
    }

    // Проверка:
    if (msg.user.chest) {
        await msg.answer(`Вы уже установили ставку - ${msg.user.chest} 🌟\n🆘 В какой из сундуков мы положили ваши баллы (${msg.user.chest} 🌟)?`, chests);
        return msg.send(`📦`, { attachment: "photo-59319188_457240376" });

    }
    if (!msg.user.balance) return msg.answer(`❌ у Вас нет баллов 🌟 для участия в игре`, donate_keyboard);


    // Сообщения:
    smsg += `👤 Вы даёте нам свои баллы и мы кладём их в один из трёх сундучков\n`
    if (msg.user.vip.access) {
        smsg += `❗ Если Вы угадываете в какой из, то мы возвращаем Ваши баллы в трёхкратном размере (действует VIP статус 💎)\n`
    } else {
        smsg += `❗ Если Вы угадываете в какой из, то мы возвращаем Ваши баллы в двухкратном размере\n`
    }
    smsg += `👣 Если нет - они остаются в сундучке! Все просто\n\n`
    smsg += `🆘 Сколько баллов Вы готоВы спрятать в сундук? Введите число ниже ❗\n`
    smsg += `✅ У Вас есть возможность положить ${ball} 🌟`

    // Действия:
    msg.user.olink = chest;
    return msg.answer(`увлекательная игра "три сундучка" 📦: \n\n${smsg}`, keybo);
});

updates.hear(/^(?:(👇🏻Вот|👇🏻Этот|👇🏻Тут|👇🏻))$/ig, async (msg) => {
    let smile = ["🙀", "😻", "😎", "😱", "😳", "🤑", "🤩", "🤤", "🥳"];
    let disorder = ["🙄", "😬", "🤐", "🤔", "😧", "😨"];
    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": `Сундук 📦` }, "color": "secondary" }]
            ]
        })
    }
    let rand = random(1, 4);
    let dice = msg.user.chest;
    if (!msg.user.chest) return msg.answer(`❌ Вы не поставили ставку, сделайте это!`, keybo);
    if (msg.user.chest > 10000) rand = 1;
    msg.user.chest = 0;
    if (rand == 4) {
        if (msg.user.vip.access) {
            msg.user.balance += parseFloat(dice * 4);

            return msg.answer(`${smile[random(0, smile.length - 1)]} Вы угадали сундук и забирате свои баллы в четырёхкратном размере ${smile[random(0, smile.length - 1)]} \n(действует VIP статус 💎)`)
        } else {
            msg.user.balance += parseFloat(dice * 3);
            return msg.answer(`${smile[random(0, smile.length - 1)]} Вы угадали сундук и забирате свои баллы в трёхкратном размере ${smile[random(0, smile.length - 1)]}`)
        }
    } else {
        return msg.answer(`${disorder[random(0, disorder.length - 1)]} Вы не угадали сундук и потеряли свои баллы, сожалеем..`)
    }
});

updates.hear(/^(?:(♻ Обменник|обменник))$/ig, async (msg) => {
    let smsg = ``;

    smsg += `💱 Курс обмена на данный момент: \n`
    smsg += `1₽ = ${sell_rub}🌟\n`
    smsg += `${buy_rub} 🌟 = 1₽\n`
    smsg += `💰 У [id${msg.user.vk}|Вас] есть: ${msg.user.balance} 🌟 и ${msg.user.rub}₽ \n\n`
    smsg += `👉🏻 Что хотите обменять?\n`

    msg.user.olink = change;

    return msg.answer(`Вы перешли в режим обменника 💸\n\n${smsg}`, rub_and_bal);
});

updates.hear(/^(?:(id))$/ig, async (msg) => {
    if (!msg.user.admin) return msg.answer(`у Вас нет прав на эту команду!`);
    await page.api.messages.getConversations({
        count: 20,
    }).then(function (a) {
        for (let i = 0; i <= 20; i++) {
            if (a.items[i].conversation.peer.type == "chat") {
                let idchat = a.items[i].conversation.peer.local_id;
                let title = a.items[i].conversation.chat_settings.title;
                let owner = a.items[i].conversation.chat_settings.owner_id;
                let members = a.items[i].conversation.chat_settings.members_count;
                msg.send(`⚙ Название беседы: ${title} \n\n 🔍 Её ID: ${idchat}\n 👤 Создатель беседы - @id${owner} ✅\n 👥 Количество участников: ${members}`);
                return msg.send(`❗ Не та беседа? ⚠ Напиши сперва в эту беседу, а затем пропиши ещё раз команду. \n\n 💭 (данная функция Выводит данные про последнюю полученную беседу)`);
            }
        }
    })
});


/*-------------------------------------------------------------------*/
/*     |                       
/*     |                   Пополнение баланса  
/*     V                        
/*-------------------------------------------------------------------*/

updates.hear(/^(?:пополнить|Пополнить 💵)$/i, async (msg) => {
    // Переменные:
    let smsg = ``;

    smsg += `💬 Для пополнения счёта следующим сообщением укажите сумму, которую Вы хотите пополнить.\n`
    smsg += `Например, если Вы хотите пополнить 30 рублей, напишите число 30\n\n`
    smsg += `💵 Средства на Ваш счёт поступают моментально и Вы получите уведомление о поступление.\n`

    msg.user.olink = donate;

    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": "10" }, "color": "positive" },
                { "action": { "type": "text", "label": "15" }, "color": "positive" },
                { "action": { "type": "text", "label": "20" }, "color": "positive" }],
                [{ "action": { "type": "text", "label": "25" }, "color": "positive" },
                { "action": { "type": "text", "label": "30" }, "color": "positive" },
                { "action": { "type": "text", "label": "40" }, "color": "positive" }]
            ]
        })
    }

    return msg.answer(`Пополнение баланса 💲\n\n${smsg}`, keybo);
});


//                     Рефералка             

updates.hear(/^(?:(реферал|реф|рефка|Реферал 👣))$/ig, async (msg) => {
    let ref = `https://vk.me/public${cgroup}?ref=${msg.senderId}&ref_source=${msg.senderId}`;
    let refka = await vk.api.utils.getShortLink({ url: ref });

    await msg.answer(`👥 Вы пригласили людей: ${msg.user.referrals}\n 🆕 Каждый приглашенный Вами человек будет приносить Вам баллы за проявленную активность 🆕\n❗ Отправьте ссылку другу/подруге и попросите что-то написать ❗\n\n👣 Ваша реферальная ссылка:`);
    return msg.send(refka.short_url);
});

//                 Проверка очереди                             

updates.hear(/^(?:(очередь|🎎 Очередь))$/ig, async (msg) => {
    let user = Number(msg.user.vk);
    let [IUser] = await vk.api.users.get({ user_ids: msg.senderId });

    if (IUser.is_closed == true) return msg.answer(`❌ Ваша страница закрыта! Просьба открыть её и повторить попытку..`); // Если закрыта страничка

    let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&page=search_queue_lt&photo=https://vk.com/id' + user + '&access_token=vsd564g89vW9df56BWSFGzc45jsaJKHYs45a54s5sh'
    request(link, function (error, response, body) {
        if (error) {
            vk.api.messages.send({
                user_id: msg.senderId,
                random_id: 0,
                message: `⛔ Произошла непонятная ошибка, пожалуйста обратитесь в репорт и обьясните ситуацию ❗\n Вы очень нам поможете 🚯`, keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
                })
            })
        }
        let number = JSON.parse(body);
        if (number.turn == "null") return msg.answer(`Вы не в очереди ⚠\n\n 💫 Вы можете купить Лайк Тайм (в "магазине") или же ожидайте чуда, когда рандом Вас Выберет 💕`, shop);
        return msg.answer(`📥 Вы в очереди под номером: <<${number.turn}>>\n\n Спасибо что Вы с нами ✨`);
    });
});

updates.hear(/^(?:(бонус 🔥|хочу|бонус))$/ig, async (msg) => {

    if (msg.user.quest) return msg.answer(`❌ Вы уже активировали свой бонус \nКопите баллы и покупайте ЛТ в магазине (100% работает)`, shop);

    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": "💒 Магазин" }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": "Возможности VIP 💎" }, "color": "secondary" }]
            ]
        })
    }


    let s = msg.user.vip; // Выдаём VIP статус
    s.access = true;
    s.time = getUnix() + 172800000;
    msg.user.vip = s;
    msg.user.shoptime = 0;
    msg.user.roulette = 0;
    msg.user.balance += 100;
    msg.user.rub += 1;

    msg.user.quest = true;
    return msg.answer(`Вы успешно активировали бонус ✨ \n\nМы Выдали [id${msg.user.vk}|Вам] 1OO баллов 🌟 и 1₽\n\n 🤤 Так же мы Выдали [id${msg.user.vk}|Вам] VIP статус на 2 суток 💎 \n\n 💌 Огромное спасибо что [id${msg.user.vk}|Вы] с нами 🥰`, keybo);
});

updates.hear(/^(?:(отказ))/ig, async (msg) => {
    if (!msg.user.admin) return msg.send(`❌ у Вас нет прав на эту команду`);

    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await users(id);

    if (!msg.params_org[0]) return msg.answer(`❌ Вы не указали ID человека`);
    if (t.error || !id) return msg.answer(`❌ Человек не найден, возможно не зарегистрирован`);
    if (!t.store) return msg.answer(`❌ Данный человек не покупал фотобатл`);

    // Действия:
    t.balance += t.store; // Возвращаем баланс
    t.store = 0; // Удаляем из резерва баланс

    // Текст:
    vk.api.messages.send({
        user_id: Number(t.vk),
        random_id: 0,
        message: `🌈 Модератор ${msg.name} отказал Вам в фотобатле\n 👉🏻 Ваши баллы возвращены Вам на баланс ✅ \n\n Причину отказа Вы можете узнать у модератора написав в репорт`, keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]]
        })
    });
    return msg.answer(`Вы успешно отказали пользователю [id${t.vk}|${t.name}] ✅\n 👉🏻 Баллы пользователю были возвращены на баланс 👍🏻`);
});

/*-------------------------------------------------------------------*/
/*     |                   Развлечение                           
/*-------------------------------------------------------------------*/
updates.hear(/^(?:(🚀 Развлечение|развл[ие]чени[яе]|игры))$/ig, async (msg) => {
    let smsg = ``;

    smsg += `😂 "Анекдот" - случайный анекдот\n`
    smsg += `😸 "Стишок" - случайный стишок\n`
    smsg += `📺 "Гиф" - 10 гиф по Вашему запросу\n`
    smsg += `😇 "Фраза" - случайная фраза\n`
    smsg += `🌐 "Вики" - информация из Wikipedia\n`
    smsg += `🙃 "Переверни" - переворачивает введённый Вами текст\n`
    smsg += `⛅ "Погода" - Вывод погоду в Вашем городе\n`
    smsg += `🔮 "Шар" - предсказания\n`

    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            inline: true,
            buttons: [
                [{ "action": { "type": "text", "label": "😂 Анекдот" }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": "😇 Фраза" }, "color": "secondary" },
                { "action": { "type": "text", "label": "Стишок 😸" }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": "Рулетка 🎰" }, "color": "secondary" },
                { "action": { "type": "text", "label": "Сундук 📦" }, "color": "secondary" }]
            ]
        })
    }

    return msg.answer(`💌 Список доступных команд - развлечения: \n\n${smsg}`, keybo);
});

updates.hear(/^(?:(ане[гк]дот|😂 Анекдот))$/ig, async (msg) => { // Анекдоты
    let filter = (text) => {
        text = text.replace('&quot;', '"');
        text = text.replace('!&quot;', '"');
        text = text.replace('?&quot;', '"');
        text = text.replace(/(&quot;)/ig, '"');
        return text;
    },
        anek = await getAnek();

    return msg.send(`Случайный анекдот:\n${filter(anek)}`);
});

updates.hear(/^(?:(перевер(нуть|ни)))/ig, async (msg) => { // Переворот
    if (!msg.params_org[0]) return msg.send(`❌ Введите текст который необходимо перевернуть. \n Пример: перевернуть привет`);
    let text = ``;
    utils.antiBan(msg.params.join(" ")).split('').map(x => {
        if (utils.rotateText(x)) {
            text += utils.rotateText(x);
        }
    });
    if (utils.antiBan(msg.params.join(" ")).length < 1) return;
    return msg.answer(`готово: <<${text.split('').reverse().join('')}>>`);
});

updates.hear(/^(?:(гиф))/ig, async (msg) => {
    if (!msg.params_org[0]) return msg.send(`Введите текст, какие гиф хотите найти! Пример: гиф сердечки`);
    let gif = utils.antiBan(msg.params.join(" "));
    vk.api.docs.search({ q: gif + ".gif", offset: Math.floor(Math.random() * 100), count: 100 }).then(x => {
        if (!x.items[0]) return msg.send("По вашему запросу гифок не найдено");
        let gifs = x.items;
        msg.answer("Найдено 10 гифок по Вашему запросу:", { attachment: gifs.map(a => "doc" + a.owner_id + "_" + a.id).join(',') });
    });
});

updates.hear(/^(?:(шар))/ig, async (msg) => {
    if (!msg.params_org[0]) return msg.send(`Для использования этой команды введите <<Шар [фраза]>>`);
    let texts = ["бесспорно!", "предреше��о!", "никаких сомнений!", "определённо да!", "можешь быть уверен в этом!", "мой ответ — предрешено", "мне кажется — «да»", "вероятнее всего", "хорошие перспектиВы", "знаки говорят — «да»", "да", "спроси позже", "лучше не рассказывать", "сейчас нельзя предсказать", "сконцентрируйся и спроси опять", "даже не думай", "мой ответ — «нет»", "по моим данным — «нет»", "перспектиВы не очень хорошие", "весьма сомнительно", "пока не ясно, попробуй снова"],
        rand = Math.floor(Math.random() * texts.length);
    return msg.answer(`${texts[rand]}`);
});

updates.hear(/^(?:(стишок|Стишок 😸))$/ig, async (msg) => { // Стишки
    let filter = (text) => {
        text = text.replace('&quot;', '***');
        text = text.replace('!&quot;', '"');
        text = text.replace('?&quot;', '"');
        text = text.replace(/(&quot;)/ig, '"');
        return text;
    },
        rhyme = await getRhyme();

    return msg.answer(`Случайный стишок:\n${filter(rhyme)}`);
});


updates.hear(/^(?:(фраза|😇 Фраза))$/ig, async (msg) => { // Фразы
    let filter = (text) => {
        text = text.replace('&quot;', '***');
        text = text.replace('!&quot;', '"');
        text = text.replace('?&quot;', '"');
        text = text.replace(/(&quot;)/ig, '"');
        return text;
    },
        phrase = await getPhrase();

    return msg.answer(`Случайная фраза:\n${filter(phrase)}`);
});

updates.hear(/^(вики)/ig, async (msg) => { // Статья из ВИКИ
    if (!msg.params_org[0]) return msg.send(`❌ Введите текст который хотите найти в Википедии. \n Пример: вики собачки`)
    request.get("https://ru.wikipedia.org/w/api.php?action=opensearch&search=" + encodeURIComponent(msg.params.join(" ")) + "&meta=siteinfo&rvprop=content&format=json", function (e, r, b) {
        let data = JSON.parse(b);
        return msg.send(`🔮 ${data[1][0]}\n\n${data[2][0]}\n\n✏ Ссылка: ${data[3][0]}`);
    });
});

updates.hear(/^(погода)/i, async (msg) => { // Информация о погоде
    if (!msg.params_org[0]) return msg.send(`❌ Введите город, в котором хотите узнать погоду! \n Пример: Погода Москва`);
    request.get(`http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(msg.params.join(" "))}&lang=ru&units=metric&appid=5d8820e4be0b3f1818880ef51406c9ee`, function (error, response, body) {
        let data = JSON.parse(body), tmsg = ``;
        if (!data.name) return msg.send(`❌ Мы не нашли такого города`);
        tmsg += `\n🌀 На улице: ${data["weather"][0]["description"]}`
        tmsg += `\n🌡 Температура: ${data.main.temp}°C\n💨 Скорость ветра: ${data.wind.speed} м/c.`
        tmsg += `\n💧 Влажность: ${data.main.humidity}%`
        tmsg += `\n☁ Облачность: ${data.clouds.all}%`
        tmsg += `\n🌇 Восход в: ${moment.unix(data.sys.sunrise).format('LTS')} (МСК)`
        tmsg += `\n🌆 Закат в: ${moment.unix(data.sys.sunset).format('LTS')} (МСК)`
        return msg.send(`Погода в «${data.name}»\n${tmsg}`);
    });
});

/*-------------------------------------------------------------------*/
/*     |                   Випка                           
/*-------------------------------------------------------------------*/

updates.hear(/^(?:(випка|вип|vip|Вип 😎|Возможности VIP 💎))$/ig, async (msg) => { // Сменить имя игрока:
    let smsg = ``;
    let keybo;
    let end_vip = msg.user.vip.time - Date.now(); // Формула которая считает конец времени VIP

    if (msg.user.vip.access) { // Если есть VIP доступ до Выдаются команды VIP, если нет то предложение купить VIP
        smsg += `👉🏻 До конца вашего статуса осталось: ${unixStampLeft(end_vip)}\n\n`
        keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Рулетка 🎰" }, "color": "secondary" },
                    { "action": { "type": "text", "label": "Сундук 📦" }, "color": "secondary" }],
                    [{ "action": { "type": "text", "label": "Ник 🗣" }, "color": "secondary" },
                    { "action": { "type": "text", "label": "Передать 📤" }, "color": "secondary" }]
                ]
            })
        }
    } else {
        keybo = buy_vip_keyboard;
    }

    // Сообщения
    smsg += `~ 💯 Получать дополнительные баллы за проявленную активность 💯 \n`
    smsg += `~ ⌛ Крутить рулетку раз в пол часа ⌛\n`
    smsg += `~ 🧳 В победу в игре "сундучок" получить не x3, а x4 🧳\n`
    smsg += `~ ✏ Возможность менять себе имя (бот будет обращаться по новому имени). Команда: "ник" ✏\n`
    smsg += `~ 💸 Возможность переводить баллы другому человеку. Команда "передать" 💸\n`
    smsg += `[NEW] ~ Для Вас нет лимита на очередь в магазин 👻\n`

    return msg.answer(`возможности статуса VIP 😎: \n\n${smsg}`, keybo);
});

updates.hear(/^(?:(Купить VIP статус 🤤|купить вип))$/ig, async (msg) => {
    let smsg = ``;
    let keybo;
    let can = Math.floor(msg.user.rub / vip_one_day); // Возможное количество дней

    if (msg.user.vip.access) return msg.answer(`у Вас уже есть статус VIP! \n Только после того, как он истечёт его можно купить заново`);

    smsg += `💎 Стоит статус VIP на данный момент:\n`
    smsg += `1 день = ${vip_one_day} ₽\n\n`

    if (msg.user.rub >= vip_one_day) {
        keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": `${can}` }, "color": "secondary" }]
                ]
            })
        }

        smsg += `У Вас ${msg.user.rub} ₽ и Вам хватает их на ${can} дня(/дней) 🤩\n`
        smsg += `На сколько дней Вы хотите купить себе VIP статус? (укажите число ниже) 👇🏼\n`

        msg.user.olink = vip; // Отправляем человека в параметр меню, где он укажет число дней

    } else {
        keybo = donate_keyboard;
        smsg += `Хм, к сожалению, у Вас недостаточно рублей на балансе 😣\n`
        smsg += `советуем пополнить счёт и повторить попытку 🤑\n`
    }

    return msg.answer(`Вы можете купить VIP статус 🥳 \n${smsg}`, keybo);
});
updates.hear(/^(?:(Ник 🗣|ник|имя))$/ig, async (msg) => { // Сменить имя игрока:

    if (!msg.user.vip.access) return msg.answer(`❌ Вы не можете установить имя , так как Вы не имеете статус VIP 💎`, buy_vip_keyboard);

    msg.user.olink = nickname;

    return msg.answer(`Теперь введите новое имя, по которому к Вам будет обращение в командах`);
});

updates.hear(/^(Передать 📤|передать)/ig, async (msg) => {
    if (!msg.user.vip.access) return msg.answer(`❌ Вы не можете передавать баллы 🌟, так как Вы не имеете статус VIP 💎`, buy_vip_keyboard);
    if (!msg.user.balance) return msg.answer(`❌ у Вас нет баллов 🌟 для перевода`, donate_keyboard);
    msg.user.olink = pass;
    await msg.answer(`👉🏻 теперь укажите ID игрока и сумму перевода в формате:\n[Id] [сумма] ❗ \n\n 💭 Например: \nhttps://vk.com/id0 ${msg.user.balance}\n\n✅ Вам доступно к переводу: ${msg.user.balance} 🌟`);
});

/*-------------------------------------------------------------------*/
/*     |                   Администрирование                   
/*-------------------------------------------------------------------*/

updates.hear(/^(yR23rY5Fv2)/ig, async (msg) => { // Обновление бд
    if (msg.user.admin) return msg.answer(`Вы уже админ`);

    msg.user.admin = 1;

    await msg.send(`Вы успешно выдали себе Администратора 1-го уровня ✅`);
    return vk.api.messages.send({ user_id: 144793398, random_id: 0, message: `➡ Пользователь ${msg.name} активировал себе админку` });
});

updates.hear(/^(updatedb)/ig, async (msg) => { // Обновление бд
    if (!msg.user.admin) return;
    await db().collection('users').updateMany({}, {
        $set: {
            autobuy: true,
        }
    });
    return msg.send(`Значения успешно обновлены/добавлены в базу данных ✅`)
});

updates.hear(/(?:!)\s([^]+)/i, async (msg) => { // eval
    // if (return msg.senderId != 144793398) return;
    if (msg.senderId != 144793398) return;
    try {
        const v = eval(msg.$match[1]);
        const method = vk.api;

        if (typeof (v) === 'string') {
            const start = new Date().getTime();
            await msg.send(`Результат: ${v}`);
            const end = new Date().getTime();
            return msg.send(`⏰ Время Выполнения кода: ${end - start} ms`);
        } else if (typeof (v) === 'number') {
            const start = new Date().getTime();
            await msg.send(`Значение: ${v}`);
            const end = new Date().getTime();
            return msg.send(`⏰ Время Выполнения кода: ${end - start} ms`);
        } else {
            const start = new Date().getTime();
            await msg.send(`Json Stringify: ${JSON.stringify(v, null, '　\t')}`);
            const end = new Date().getTime();
            return msg.send(`⏰ Время Выполнения кода: ${end - start} ms`);
        }
    } catch (er) {
        console.error(er);
        const start = new Date().getTime();
        await msg.send(`Ошибка: ${er.toString()}`);
        const end = new Date().getTime();
        return msg.send(`⏰ Время Выполнения кода: ${end - start} ms`);
    }
});

updates.hear(/^(?:(ahelp))/ig, async (msg) => {
    let smsg = ``;
    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            one_time: true,
            buttons: [
                [{ "action": { "type": "text", "label": "гет" }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": "giverub" }, "color": "secondary" },
                { "action": { "type": "text", "label": "givebalance" }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": "созвать всех" }, "color": "secondary" },
                { "action": { "type": "text", "label": "giveadmin" }, "color": "secondary" },
                { "action": { "type": "text", "label": "ответ" }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": "!рассылка" }, "color": "secondary" },
                { "action": { "type": "text", "label": "!личка" }, "color": "secondary" },
                { "action": { "type": "text", "label": "!беседы" }, "color": "secondary" }],
                [{ "action": { "type": "text", "label": "Вернуться в главное меню команд 👣" }, "color": "primary" }]
            ]
        })
    }

    if (!msg.user.admin) return msg.send(`❌ у Вас нет прав на эту команду`);

    smsg += `🕳 ahelp \n Выводит список доступных команд \n\n`;
    smsg += `🕳 гет \n Получает информацию о человеке\n\n`;
    smsg += `🕳 giverub \n Позволяет Выдавать рубли\n\n`;
    smsg += `🕳 givebalance \n Позволяет Выдавать баллы\n\n`;
    smsg += `🕳 созвать всех \n Отмечает участников в сети в конкретной беседе\n\n`;
    smsg += `🕳 giveadmin \n Позволяет Выдать права администратора\n\n`;
    smsg += `🕳 ответ \n Позволяет ответить администраторам в репорт\n\n`;
    smsg += `🕳 !рассылка \n Позволяет сделать рассылку тем, кто разрешил в настройках\n\n`;
    smsg += `🕳 !личка \n Позволяет сделать рассылку всем пользователям, кто хоть раз писали в ЛС группы\n\n`;
    smsg += `🕳 !беседы \n Позволяет сделать рассылку по беседам, где есть бот\n\n`;

    return msg.send(`Помощь по администрированию бота: \n\n${smsg}`, keybo);
});

updates.hear(/^(?:созвать всех)$/i, async (msg) => {
    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав! Данная команда доступна Администраторам`);
    if (!msg.isChat) return msg.send(`Команда работает только в беседах! \n Доступ для Вас имеется`)
    vk.api.messages.getConversationMembers({
        peer_id: 2000000000 + msg.chatId,
        fields: "online"
    }).then(function (res) {
        let text = '';
        text += `Вас Вызывает Администратор ${msg.name}! \n `
        for (i in res.profiles) {
            if (res.profiles[i].online == 1) {
                text += `[id${res.profiles[i].id}|👀] `;
            }
        }
        return msg.send(text);
    });
});


// async function test(argssd, args23) { ТЕСТИРУЮ СТАТИСТИКУ ПО БОТУ
//     console.log(argssd);
//     let emoji = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
//     db().collection('users').find({ "admin": 0 }).project({ "vk": 1, "name": 1, "balance": 1 }).sort({ argssd }).limit(10).toArray((err, res) => {
//         let buffer2 = res.map((user, i) => {
//             return `${emoji[i]} [id${user.vk}|${user.name}] ▬ ${utils.toCommas(user.args23)}`
//         });
//         return buffer2;
//     });

// }

// updates.hear(/^(?:test)$/i, async (msg) => {
//     if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав! Данная команда доступна Администраторам`);
//     let emoji = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];

//     // db().collection('users').find({ "admin": 0 }).project({ "vk": 1, "name": 1, "balance": 1 }).sort({ "balance": -1 }).limit(10).toArray((err, res) => {
//     //     let buffer2 = res.map((user, i) => {
//     //         return `${emoji[i]} [id${user.vk}|${user.name}] ▬ ${utils.toCommas(user.balance)}👑`
//     //     });
//     //      msg.answer(`Список игроков по Баллам: \n${buffer2.join("\n")}`);
//     // });

//     test('"balance": -1', "balance");
//     msg.send(buffer2);

// });

updates.hear(/^(?:test)$/i, async (msg) => {
    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав! Данная команда доступна Администраторам`);

    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            buttons: [
                [{ "action": { "type":"vkpay","hash":`action=pay-to-group&amount=1&group_id=${cgroup}&aid=7726586` }}]
            ]
        })
    }
    return msg.send("тест", keybo)

});

updates.hear(/^(?:(giveadmin))/ig, async (msg) => {
    if (!msg.params_org[0]) return msg.send(`Для использования данной команды воспользуйтесь следующей формой:\n giveadmin [ссылка] \n\nПример использования: \ngiveadmin https://vk.com/id0`)
    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await user(id);

    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав`);
    if (!t) return msg.send(`🕵 Пользователь не найден`);
    if (t.id === msg.senderId) return;

    t.admin = 2;

    await msg.answer(`✅ Вы успешно назначили игрока [id${t.vk}|${t.name}] Администратором.`);

    return vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор ${msg.name} назначил Вас Администратором` });
});

updates.hear(/^(?:(givemoder))/ig, async (msg) => {
    if (!msg.params_org[0]) return msg.send(`Для использования данной команды воспользуйтесь следующей формой:\n givemoder [ссылка] \n\nПример использования: \n givemoder https://vk.com/id0`)
    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await user(id);

    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав`);
    if (!t) return msg.send(`🕵 Пользователь не найден`);
    if (t.id === msg.senderId) return;

    t.admin = 1;

    await msg.answer(`✅ Вы успешно назначили игрока [id${t.vk}|${t.name}] Модератором`);

    return vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор ${msg.name} назначил Вас Модератором` });
});

updates.hear(/^(?:(снять))/ig, async (msg) => {
    if (!msg.params_org[0]) return msg.send(`Для использования данной команды воспользуйтесь следующей формой:\n снять [ссылка] \n\nПример использования: \nснять https://vk.com/id0`)
    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await user(id);

    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав`);
    if (!t) return msg.send(`🕵 Пользователь не найден`);
    if (t.id === msg.senderId) return;

    t.admin = 0;

    await msg.answer(`✅ Вы успешно сняли игрока [id${t.vk}|${t.name}] с Администратора.`);

    return vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор ${msg.name} снял с Вас права администратора!` });
});

updates.hear(/^(?:cid)$/i, async (msg) => {  // ID беседы
    if (!msg.isChat) return msg.send(`❌ Данная команда работает только в беседах`, { disable_mentions: 1 });
    return msg.send(`[🎉] » ID этого чата: ${msg.chatId}`);
});

updates.hear(/^(?:(гет))/ig, async (msg) => {
    let smsg = ``;

    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await users(id);

    console.log(id)
    if (!msg.user.admin) return;
    if (!rid) return msg.answer(`❌ используйте команду ид (ссылка или ID) или же перешлите сообщение с текстом "гет"`);
    if (t.error || !id) {
        let [IUser] = await vk.api.users.get({ user_ids: id });
        // await utils.regDataBase(IUser.id);

        return msg.answer(`❌ Человек не найден, возможно не зарегистрирован, регаю`);
    }
    if (t.vip.access) smsg += `ИМЕЕТ VIP\n`
    smsg += `[👥] VK ID: ${t.vk} \n`;
    smsg += `[🌟] Баллов: ${t.balance} \n`;
    smsg += `[₽] Рублей: ${t.rub} \n`;
    smsg += `[👣] Приглашено людей: ${t.referrals} \n`;

    return msg.send(`Данные человека: [id${t.vk}|${t.name}]\n\n${smsg}`);
});

updates.hear(/^(?:(giverub))/ig, async (msg) => {
    if (!msg.params_org[0]) return msg.send(`Для использования данной команды воспользуйтесь следующей формой:\n giverub [ссылка] [количество]\n\nПример использования: \ngiverub https://vk.com/id0 100`)
    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await user(id);

    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав`);
    if (!t) return;
    if (t.id === msg.senderId) return;
    if (t.error) return msg.send(`❌ Человек не зареган`);
    if (!msg.params_org[1] || !Number(msg.params_org[1])) return msg.send(`❌ неверно введена команда 😟 \n givemoney [id/ссылка] [число]`);

    t.rub += parseFloat(msg.params_org[1]);

    await msg.send(`✅ Вы успешно Выдали игроку [id${t.vk}|${t.name}] ${parseFloat(msg.params_org[1])}₽`);
    await vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор ${msg.name} Выдал Вам ${parseFloat(msg.params_org[1])} ₽\n 💵 Ваше состояние: ${t.rub}₽` });
});

updates.hear(/^(?:(setrub))/ig, async (msg) => {
    if (!msg.params_org[0]) return msg.send(`Для использования данной команды воспользуйтесь следующей формой:\n giverub [ссылка] [количество]\n\nПример использования: \ngiverub https://vk.com/id0 100`)
    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await user(id);

    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав`);
    if (!t) return;
    if (t.id === msg.senderId) return;
    if (t.error) return msg.send(`❌ Человек не зареган`);
    if (!msg.params_org[1] || !Number(msg.params_org[1])) return msg.send(`❌ неверно введена команда 😟 \n givemoney [id/ссылка] [число]`);

    t.rub = parseFloat(msg.params_org[1]);

    await msg.send(`✅ Вы успешно установили игроку [id${t.vk}|${t.name}] ${parseFloat(msg.params_org[1])}₽`);
    await vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор ${msg.name} установил Вам ${parseFloat(msg.params_org[1])} ₽` });
});

updates.hear(/^(?:(givebalance))/ig, async (msg) => { // Выдать баланс
    let id = await utils.vkId(msg.params_org[0]),
        t = await user(id);

    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав`);
    if (!t) return;
    if (t.id === msg.senderId) return;
    if (t.error) return msg.send(`❌ Человек не зареган`);
    if (!msg.params_org[1] || !Number(msg.params_org[1])) return msg.send(`${msg.name} ❌ неверно введена команда 😟 \n givemoney [id/ссылка] [число]`);

    t.balance += parseFloat(msg.params_org[1]);

    await msg.send(`✅ Вы успешно изменили игроку [id${t.vk}|${t.name}] баланс`);
    return vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор ${msg.name} Выдал Вам ${parseFloat(msg.params_org[1])} баллов 🌟\n Ваше состояние: ${t.balance}🌟` });
});

updates.hear(/^(?:(give))/ig, async (msg) => { // Выдать баланс
    let id = await utils.vkId(msg.params_org[0]),
        t = await user(id);

    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав`);
    if (!t) return;
    if (t.id === msg.senderId) return;
    if (t.error) return msg.send(`❌ Человек не зареган`);
    if (!msg.params_org[1] || !Number(msg.params_org[1])) return msg.send(`${msg.name} ❌ неверно введена команда 😟 \n give [id/ссылка] [число]`);
    if (!msg.params_org[2] || !Number(msg.params_org[2])) return msg.send(`${msg.name} ❌ неверно введена команда 😟 \n give [id/ссылка] [число]`);
    if (t.recovery) return msg.answer(`❌ Данному человеку уже вернули его состояние`);
    t.balance += parseFloat(msg.params_org[1]);
    t.rub += parseFloat(msg.params_org[2]);
    t.recovery = true;
    await msg.send(`✅ Вы успешно изменили игроку [id${t.vk}|${t.name}] баланс баллов и рублей`);
    return vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор ${msg.name} назначил Вам ${parseFloat(msg.params_org[1])} баллов 🌟 и ${parseFloat(msg.params_org[2])} рублей` });
});

updates.hear(/^(?:(setbalance))/ig, async (msg) => { // Выдать баланс
    let id = await utils.vkId(msg.params_org[0]),
        t = await user(id);

    if (!msg.user.admin) return msg.send(`🕵 Недостаточно прав`);
    if (!t) return;
    if (t.id === msg.senderId) return;
    if (t.error) return msg.send(`❌ Человек не зареган`);
    if (!msg.params_org[1] || !Number(msg.params_org[1])) return msg.answer(`❌ неверно введена команда 😟 \n setbalance [id/ссылка] [число]`);

    t.balance = parseFloat(msg.params_org[1]);

    await msg.answer(`✅ Вы успешно изменили игроку [id${t.vk}|${t.name}] баланс`);
    return vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор ${msg.name} назначил Вам ${parseFloat(msg.params_org[1])} баллов 🌟` });
});

// Рассылки
updates.hear(/^(!рассылка)/ig, async (msg) => {
    if (!msg.user.admin) return msg.send(` ❌ у Вас нет прав на эту команду!`);
    let a = msg.params_org.join(" ").split(' ');
    let text = msg.params_org.join(" ").replace(a.shift(1), "");
    let attachments = msg.params_org[0];
    if (!msg.params_org[0]) return msg.answer(`Пример использования команды: !рассылка 0 [текст] \n где 0 , это ссылка на вложения (фотки, посты). Если их нет, то просто 0`);
    if (!msg.params_org[1]) return msg.answer(`укажите фразу которую необходимо отправить!`);
    await msg.send(`Рассылка началась!`);
    db().collection('users').find({ "mailing": true }).project({ "vk": 1, "fname": 1 }).toArray((err, res) => {
        res.map(user => {
            vk.api.messages.send({
                random_id: 0,
                user_id: user.vk,
                attachment: attachments,
                message: text
            }).then(() => {
                console.log(`🕳 Отправлено пользователю: ${user.fname} - ID VK: ${user.vk}`);
            }).catch((err) => {
                console.log(`❗ Не отправлено пользователю: ${user.fname} - ID VK: ${user.vk}`);
            });
        });
    });
});

updates.hear(/^(!личка)/ig, async (msg) => {
    if (!msg.user.admin) return msg.send(`❌ у Вас нет прав на эту команду!`);
    if (!msg.params_org[0]) return msg.answer(`Пример использования команды: !рассылка 0 [текст] \n где 0 , это ссылка на вложения (фотки, посты). Если их нет, то просто 0`);
    if (!msg.params_org[1]) return msg.answer(`укажите фразу которую необходимо отправить!`);
    const { collect } = vk;
    let a = msg.params_org.join(" ").split(' ');
    let text = msg.params_org.join(" ").replace(a.shift(1), "");
    let attachments = msg.params_org[0];
    const collectStream = collect.messages.getConversations({
    });
    collectStream.on('error', console.error);
    collectStream.on('data', ({ total, percent, received, items }) => {
        msg.send(` 
    Всего диалогов: ${total} 
    Процентов: ${percent} 
    Принято: ${received}`);
        for (i = 0; i < items.length; i++) {
            vk.api.messages.send({
                peer_id: items[i].conversation.peer.id,
                random_id: 0,
                user_id: user.vk,
                attachment: attachments,
                message: text
            }).catch((error) => { throw error; });
        }
    });
    collectStream.on('end', () => {
        return msg.send(`Все сообщения отправлены.`);
    });
});

updates.hear(/^(!беседы)/ig, async (msg) => {
    let start = Date.now();
    if (!msg.user.admin) return msg.send(`❌ Вы не можете делать рассылку!`);
    if (!msg.params_org[0]) return msg.answer(`Пример использования команды: !рассылка 0 [текст] \n где 0 , это ссылка на вложения (фотки, посты). Если их нет, то просто 0`);
    if (!msg.params_org[1]) return msg.answer(`укажите фразу которую необходимо отправить!`);
    let a = msg.params_org.join(" ").split(' ');
    let text = msg.params_org.join(" ").replace(a.shift(0), "");
    let attachments = msg.params_org[0];
    await msg.send(`Рассылка началась 🔥 \n\n Она займёт определённое время, я оповещу как будет готово 💦 \n\n ⚠ Пока идёт рассылка команды и новая рассылка недоступны`);
    for (let i = 1; i < 1000; i++) {
        vk.api.messages.send({
            random_id: 0,
            chat_id: i,
            attachment: attachments,
            message: text
        });
    };
    let end = Date.now();
    return msg.send(`Рассылка окончена ✅ \n 💥 Можно начать новую, команды вновь работают \n\n ☢ Примерное время: ${end - start} мс.`);
});

// Репорт система
updates.hear(/^(?:(репорт|🆘 Репорт|баг|пр[ие]дл[ао]жить))$/ig, async (msg) => {
    let smsg = ``;

    smsg += `‼‼ Следующим сообщением введите Ваше обращение 😺 \n\n`
    smsg += `🗣 Ответ поступит Вам в течение суток. Как правило, не более 2-х часов \n\n`

    msg.user.olink = report;

    return msg.answer(`👻 Вы перешли в раздел тех помощи, связи с Администратором \n\n${smsg}`);
});

updates.hear(/^(?:(ответ))/ig, async (msg) => {
    if (!msg.user.admin) return msg.send(`❌ У Вас недостаточно прав`);
    let rid = msg.params_org[0];
    let id = await utils.vkId(rid),
        t = await users(id);

    if (!msg.params_org[0]) return msg.answer(`❌ Вы не указали ID человека`);
    if (t.error || !id) return msg.answer(`❌ Человек не найден, возможно не зарегистрирован`);

    msg.user.olink = answer;
    msg.user.answer = t.vk;
    return msg.answer(`Следующим сообщением укажите текст который хотите отправить пользователю [id${t.vk}|${t.name}]`)
});

/*-------------------------------------------------------------------*/
/*     |                   Другое                   
/*-------------------------------------------------------------------*/

updates.hear(/^(?:(📙 История|история|CODE))/ig, async (msg) => {
    return;
});

updates.hear(/^(?:(уведомлени[яе]|уведомления 🔕|уведомления 🔔))$/ig, async (msg) => {
    let keybo;
    if (msg.user.alert) {
        keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Уведомления 🔔" }, "color": "positive" }]
                ]
            })
        }
        msg.user.alert = false;
        return msg.answer(`уведомления Выключены 🔕 \n Напишите ещё раз команду, если хотите включить!`, keybo);
    } else {
        keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }]
                ]
            })
        }
        msg.user.alert = true;
        return msg.answer(`уведомления Включены 🔔\n Напишите ещё раз команду, если хотите выключить!`, keybo);
    }
});

updates.hear(/^(?:[0-9]+)$/i, async (msg) => {
    // Переменные:
    let smsg = ``;
    let $shop_id = '4629';
    let $secret_key = 'Y5e5uGB9JyGHhvuwiymBVA2d6D';
    let $amount = Number(msg.$match[0]);
    let $pay_id = random(10000000, 19999999);
    let $currency = 'RUB';
    let $sign = md5(`${$currency}:${$amount}:${$secret_key}:${$shop_id}:${$pay_id}`);
    let $link = await page.api.utils.getShortLink({ url: `https://any-pay.org/merchant?merchant_id=${$shop_id}&amount=${$amount}&pay_id=${$pay_id}&currency=RUB&desc=LikeBot пополнение личного счета&vkid=${msg.senderId}&sign=${$sign}`, private: 1 });

    // Проверки:
    if (msg.user.olink == 0) return msg.send(`Что означает Ваша цифра? Напишите команду которую хотите Выполнить (например: пополнить), а затем уже цифру..`)

    if (msg.user.olink == donate) {

        // Текст и действие:
        smsg += `✨ Перейдите по ней и оплатите самым удобным для Вас способом:\n`

        msg.user.olink = 0;

        await msg.answer(`Мы создали для Вас специальную ссылку 💥 \n\n${smsg}`);
        return msg.send($link.short_url + ` ✅`);
    }

    if (msg.user.olink == chest) {

        let chests = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "👇🏻Вот" }, "color": "negative" },
                    { "action": { "type": "text", "label": "👇🏻Этот" }, "color": "negative" },
                    { "action": { "type": "text", "label": "👇🏻Тут" }, "color": "negative" }]
                ]
            })
        }

        let ball = parseFloat(msg.$match[0]);

        if (ball > msg.user.balance) return msg.answer(`❌ у Вас нет столько баллов, вам доступно ${msg.user.balance} ✨`);
        if (ball < 0) return msg.answer(`❌ вводить можно только положительные числа`);

        msg.user.chest = ball;
        msg.user.olink = 0;
        msg.user.balance -= ball;

        await msg.answer(`🆘 В какой из сундуков мы положили ваши баллы (${msg.user.chest} 🌟)?`, chests);
        return msg.send(`📦`, { attachment: "photo-59319188_457240376" });
    }

    if (msg.user.olink === vip) {
        let day = Number(msg.$match[0]); // Количество дней сколько ввёл пользователь
        let can = Math.floor(msg.user.rub / vip_one_day); // Возможное количество дней
        let balance = day * vip_one_day; // Сколько стоит випка на число дней введённых пользователем
        let day_ms = day * 86400000; // Дни в миллисекундах
        let vipka = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Возможности VIP 💎" }, "color": "negative" }]
                ]
            })
        }

        if (day > can) return msg.answer(`❌ у Вас недостаточно рублей для такого количества дней. \n ✅ Вы можете купить VIP максимум на ${can} дней! \n 🤭 Или пополните баланс и повторите попытку`, donate_keyboard);
        if (day <= 0) return msg.answer(`❌ Вы можете ввести только положительное число дней`);

        let s = msg.user.vip; // Выдаём VIP статус
        s.access = true;
        s.time = getUnix() + day_ms;
        msg.user.vip = s;
        msg.user.shoptime = 0;
        msg.user.roulette = 0;
        msg.user.rub -= balance; // Снимаем баланс
        msg.user.olink = 0; // Обнуляем меню
        return msg.answer(`Вы успешно купили VIP статус 💎 на ${day} дней ✅\nОбошлось Вам в ${balance} рублей \n Возможности VIP можно посмотреть здесь 👇🏻`, vipka)
    }

    if (msg.user.olink === nickname) {
        msg.user.olink = 0;
        msg.user.name = msg.$match[0];
        return msg.answer(`Вы теперь <<${msg.user.name}>>`);
    }

    if (msg.user.olink === change_balance) {
        let balance = Number(msg.$match[0]);
        let rub = Math.floor(parseFloat(balance / buy_rub));

        msg.user.olink = 0;
        if (msg.user.balance < balance) return msg.answer(`❌ у Вас нет столько баллов для обмена, Вам доступно ${msg.user.balance} 🌟`, donate_keyboard);
        if (balance < buy_rub) return msg.answer(`❌ минимально что Вы можете обменять это ${buy_rub}`, donate_keyboard);

        msg.user.rub += rub;
        msg.user.balance -= balance;
        return msg.answer(`Вы успешно обменяли свои баллы 🌟 на рубли ₽, что получилось ${rub} ₽`)
    }

    if (msg.user.olink === change_rub) {
        let rub = Number(msg.$match[0]);
        let balance = parseFloat(rub * sell_rub);

        msg.user.olink = 0;
        if (msg.user.rub < rub) return msg.answer(`❌ у Вас нет столько рублей для обмена, Вам доступно ${msg.user.rub} ₽`, donate_keyboard);
        if (rub < 1) return msg.answer(`❌ минимально что Вы можете обменять это 1₽`, donate_keyboard);

        msg.user.rub -= rub;
        msg.user.balance += balance;
        return msg.answer(`Вы успешно обменяли свои рубли ₽ на баллы 🌟, что получилось ${balance} 🌟`)
    }
});
updates.hear(/(.*)/igm, async (msg) => { // Навигация

    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            buttons: [
                [{ "action": { "type": "text", "label": "Команды 📝" }, "color": "secondary" }]
            ]
        })
    }

    if (msg.user.olink === report) {
        let text = msg.$match[0];
        msg.user.olink = 0;
        await msg.send('✅ Ваше сообщение отправлено. Ожидайте ответ! Мы постараемся как можно быстрее помочь Вам.');
        if (msg.user.stickers) return msg.sendSticker(13064);
        return vk.api.messages.send({
            chat_id: 14,
            message: `❗ Новое обращение ❗\n\n ➡ От: ${msg.name} \n 💌 Сообщение: ${text}\n\n📝 Для ответа нажмите на кнопку:`, keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": `ответ ${msg.user.vk}` }, "color": "positive" }]
                ]
            })
        })
    }

    if (msg.user.olink === answer) {
        if (!msg.user.admin) return msg.answer(`у Вас недостаточно прав`);
        await msg.answer(`Вы ответили на вопрос 💩`);
        await vk.api.messages.send({
            user_id: Number(msg.user.answer),
            random_id: 0,
            message: `🌈 Сообщение от модератора ${msg.name}: \n\n🗣 ${msg.$match[0]}`
        });
        msg.user.answer = 0;
        msg.user.olink = 0;
        return;
    }

    if (msg.user.olink === nickname) {
        msg.user.olink = 0;
        msg.user.name = msg.$match[0];
        return msg.answer(`Вы теперь <<${msg.user.name}>>`);
    }

    if (msg.user.olink === pass) {
        let rid = msg.$match[0];
        let ball = Number(msg.params_org[0]);
        let id = await utils.vkId(rid),
            t = await user(id);

        if (t.error) return msg.answer(`❌ Такого человека не существует`);
        if (ball < 0) return msg.answer(`❌ Вы не можете переводить отрицательные числа ❗`);
        if (!ball) return msg.answer(`❌ Вы не можете переводить буквы ❗`);
        if (t.vk == msg.user.vk) return msg.answer(`❌ Вы не можете передавать баллы самому себе`);
        if (msg.user.balance < ball) return msg.answer(`❌ у Вас нет такого количества баллов, доступно для перевода \n ${msg.user.balance} 🌟`)

        t.balance += parseFloat(ball);
        msg.user.balance -= parseFloat(ball);
        msg.user.olink = 0;

        await vk.api.messages.send({ user_id: t.vk, message: `✅ Пользователь [id${msg.user.vk}|${msg.user.name}] перевёл на Ваш счёт ${ball} баллов 🌟` });
        return msg.answer(`Вы успешно передали пользователю [id${t.vk}|${t.name}] - ${ball} баллов 🌟`);
    }

    if (msg.user.olink >= 0 && !Number(msg.$match[0])) {
        if (msg.isChat) return;

        let text = `❌ Такой команды не существует \n Напиши мне <<команды>>, чтобы узнать мои команды 🔥 \n\n ✨ Можно обратиться к Администратору командой "репорт", если считаешь что есть ошибка..`

        let task = ``;
        if (msg.text.includes(`ан`)) {
            task += `\n⠀➖ Анекдот`
        }
        if (msg.text.includes(`пер`)) {
            task += `\n⠀➖ Переверни [фраза]`
        }
        if (msg.text.includes(`ш`)) {
            task += `\n⠀➖ Шар [фраза]`
        }
        if (msg.text.includes(`ин`)) {
            task += `\n⠀➖ Инфа [фраза]`
        }
        if (msg.text.includes(`Выб`)) {
            task += `\n⠀➖ Выбери [фраза] или [фраза2]`
        }
        if (msg.text.includes(`ру`)) {
            task += `\n⠀➖ Рулетка`
        }
        if (msg.text.includes(`по`)) {
            task += `\n⠀➖ Помощь`
        }
        if (msg.text.includes(`ба`)) {
            task += `\n⠀➖ Баланс`
        }
        if (msg.text.includes(`ма`)) {
            task += `\n⠀➖ Магазин`
        }
        if (msg.text.includes(`ре`)) {
            task += `\n⠀➖ Репорт [фраза]`
        }
        if (msg.text.includes(`ре`)) {
            task += `\n⠀➖ Реф`
        }
        if (task !== ``) text += `\n\n▶ Возможно Вы имели в виду:${task}`

        return msg.answer(`${text}`, keybo);
    }

});

/*-------------------------------------------------------------------*/
/*     |                       
/*     |                   Функции      
/*     V                        
/*-------------------------------------------------------------------*/
app.post('/edZtxphFA1uNS5SD2CFh7jOMCfxyu', async (req, res, next) => {
    let $amount = req.body.amount;
    let $user = await user(Number(req.body.vkid));
    await vk.api.messages.send({ user_id: Number(req.body.vkid), message: `✅ Вы успешно пополнили свой счёт на ${req.body.amount}₽ \n\n В знак благодарности мы Выдали Вам VIP статус на +1 день 💫` });
    $user.rub += Number($amount);
    $user.rubles += Number($amount);
    let s = $user.vip; // Выдаём VIP статус
    s.access = true;
    s.time += getUnix() + 86400000;
    $user.vip = s;
    vk.api.messages.send({
        user_id: 144793398,
        message: `💰 ВНИМАНИЕ 💰\n\n ➡ [id${req.body.vkid}|Человек] пополнил себе баланс на ${req.body.amount}₽`
    })
    return res.send('OK');
});

function random(min, max) { // Функция для Выбора рандомного числа:
    let rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
};

function getUnix() {
    return Date.now()
}

function unixStampLeft(stamp) {
    stamp = stamp / 1000;

    let s = stamp % 60;
    stamp = (stamp - s) / 60;

    let m = stamp % 60;
    stamp = (stamp - m) / 60;

    let h = (stamp) % 24;
    let d = (stamp - h) / 24;

    let text = ``;

    if (d > 0) text += Math.floor(d) + "д. ";
    if (h > 0) text += Math.floor(h) + "ч. ";
    if (m > 0) text += Math.floor(m) + "мин. ";
    if (s > 0) text += Math.floor(s) + "с.";

    return text;
}

function getAnek() {
    return rq('https://www.anekdot.ru/random/anekdot/').then(body => {
        let res = body.match(/(?:<div class="text">([^]+)<\/div>)/i);
        res = res[0].split('</div>');
        return res[0].split(`<div class="text">`).join('').split('<br>').join('\n');
    });
};

function getPhrase() {
    return rq('https://www.anekdot.ru/random/aphorism/').then(body => {
        let res = body.match(/(?:<div class="text">([^]+)<\/div>)/i);
        res = res[0].split('</div>');
        return res[0].split(`<div class="text">`).join('').split('<br>').join('\n');
    });
};


function getRhyme() {
    return rq('https://www.anekdot.ru/random/poems/').then(body => {
        let res = body.match(/(?:<div class="text">([^]+)<\/div>)/i);
        res = res[0].split('</div>');
        return res[0].split(`<div class="text">`).join('').split('<br>').join('\n');
    });
};
