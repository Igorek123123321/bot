/*jslint esversion: 6, evil: true, loopfunc: true */ 
const db = require('../modules/MongoConnect'),
      config = require("../config.json"),
      {VK} = require('vk-io'),
      vkGroup = new VK({ token: config.access_token.group1 }),
      page = new VK({ token: config.access_token.page1 });



module.exports = {
    moneysg:function(moneys1,all1){
        if (moneys1 == "всё" || moneys1 == "все" || moneys1 == "вабанк" || moneys1 == "ва-банк") {
            money =  parseFloat(all1)
        } else if (moneys1.match(/[kк]/gi)) {
            let count = moneys1.match(/(k|к)/gi).length;
            money = Number(moneys1.replace(/[^.\d]+/g,"").replace(/^([^\.]*\.)|\./g, '$1'))*Math.pow(1000,count);
        } else return money = parseFloat(moneys1)
        if (isNaN(money) || !moneys1) return parseFloat(0);
        return parseFloat(money);
    },
    moneys: function (moneys, all) {
        if (moneys.match(/[kк]/gi)) {
            let count = moneys.match(/(k|к)/gi).length;
            money = Number(moneys.replace(/[^.\d]+/g,"").replace(/^([^\.]*\.)|\./g, '$1'))*Math.pow(1000,count);
        } else if (moneys.match(/вс[её]/gi)) {
            money =  parseFloat(all)
        } else return money = parseFloat(moneys)
        if (isNaN(money) || !moneys) return parseFloat(0);
        return parseFloat(money);
    },
    toCommas:function(n){
        let coins = Math.floor(parseFloat(n))
        return (coins).toLocaleString().replace(/,/g, '.');
    },
    antiBan:function(str) { 
        let text = str.toString().replace(/([\[\]|:;@*<«.&#»>"']+|\\u.{1,10})/gi, " "); 
        return text;
    },
	gi:(int) => {
		int = int.toString();

		let text = ``;
		for (let i = 0; i < int.length; i++)
		{
			text += `${int[i]}&#8419;`;
		}

		return text;
    },
    rotateText:(int) => {
        let text = {
            q: 'q',
            w: 'ʍ',
            e: 'ǝ',
            r: 'ɹ',
            t: 'ʇ',
            y: 'ʎ',
            u: 'u',
            i: 'ᴉ',
            o: 'o',
            p: 'p',
            a: 'ɐ',
            s: 's',
            d: 'd',
            f: 'ɟ',
            g: 'ƃ',
            h: 'ɥ',
            j: 'ɾ',
            k: 'ʞ',
            l: 'l',
            z: 'z',
            x: 'x',
            c: 'ɔ',
            v: 'ʌ',
            b: 'b',
            n: 'n',
            m: 'ɯ',

            й: 'ņ',
            ц: 'ǹ',
            у: 'ʎ',
            к: 'ʞ',
            е: 'ǝ',
            н: 'н',
            г: 'ɹ',
            ш: 'm',
            щ: 'm',
            з: 'ε',
            х: 'х',
            ъ: 'q',
            ф: 'ф',
            ы: 'ıq',
            в: 'ʚ',
            а: 'ɐ',
            п: 'u',
            р: 'd',
            о: 'о',
            л: 'v',
            д: 'ɓ',
            ж: 'ж',
            э: 'є',
            я: 'ʁ',
            ч: 'һ',
            с: 'ɔ',
            м: 'w',
            и: 'и',
            т: 'ɯ',
            ь: 'q',
            б: 'ƍ',
            ю: 'oı',
            " ": ' ',
            1: 'Ɩ',
            2: 'ᄅ',
            3: 'Ɛ',
            4: 'ㄣ',
            5: 'ϛ',
            6: '9',
            7: 'ㄥ',
            8: '8',
            9: '6',
            0: '0'
        }
		return text[int];
	},
    vkId:function(str) {
        str = str+"";
        return new Promise((r, x) => {
            if (parseInt(str) <= 1000000) {
                db().collection('users').findOne({
                    vk: parseInt(str)
                }, (error, user) => {
                    console.log(user)
                    if (user) { r(user.vk) } else { r(-1) }
                });
            } else if (parseInt(str) > 1000000) {
                db().collection('users').findOne({
                    vk: parseInt(str)
                }, (error, user) => {
                    if (user) { r(user.vk) } else { r(-1) }
                });
            } else {
                let link = str.match(/(https?:\/\/)?(m\.)?(vk\.com\/)?([a-z_0-9.]+)/i)
                if (!link) return r(-1)
                vkGroup.api.call("utils.resolveScreenName", { screen_name: link[4] }).then(s => {
                    r(s.object_id)
                }).catch(h => {
                    r(-1);
                });
            }
        });
    },

    regDataBase: async function(id_user){
        let [IUser] = await vkGroup.api.users.get({ user_ids: id_user });
        db().collection("users").insertOne({
            // Информация об игроке:
            vk: id_user, // Вконтакте
            name: IUser.first_name, // Имя
            lpost1: 0, // Последний лайкнутый пост в группе 1
            lastlikes1: 0, // Последние лайкнутые люди в группе 1
            lpost2: 0, // Последний лайкнутый пост в группе 2
            lastlikes2: 0, // Последние лайкнутые люди в группе 2
            lpost3: 0, // Последний лайкнутый пост в группе 3
            lastlikes3: 0, // Последние лайкнутые люди в группе 3
            balance: 0, // Баланс
            store: 0, // Временное хранение
            rub: 0, // Рубли
            rubles: 0, // задоначено рублей
            points: 0, // Всего баллов за день
            price: [{"points": { "mixed": 100, "first": 1000, "apart": 1500 }, "rub": {  "mixed": 5, "first": 10, "apart": 15, "securing": 30 }}], // Цена в магазине
            autobuy: true, // Автопокупка
            stock: false, // Акционное
            admin: false, // Администатор
            answer: 0, // Ответ кому идёт
            mailing: true, // Рассылка
            alert: true, // Оповещение
            quest: false, // Квест
            ref: 0, // Реферал
            referrals: 0, // Количество рефералов
            roulette: 0, // Время рулетки
            shoptime: 0, // Время для покупки в магазине
            chest: 0, // Ставка в сундуке
            vip: { // VIP статус
                access: false,
                time: 0
            },
            olink: 0, // Параметр для menu
            lastOnline: Date.now(), // Последний заход
            cmd: 0
        });
    },
    random: function(min, max) { // Функция для Выбора рандомного числа:
        let rand = min + Math.random() * (max + 1 - min);
        rand = Math.floor(rand);
        return rand;
    },
    chunks:function(array, size) { let results = []; while (array.length) { results.push(array.splice(0, size)); } return results; },
};
