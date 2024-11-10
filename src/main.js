import { gen1Cards } from "../gen/1.js";
const app = Vue.createApp({
    created() { },
    data() {
        return {
            cards: {
                "gen1":{
                }
            },
            captured:{
                "gen1":[]
            },
            packs: {
                "gen1":{
                    "噴火龍":{
                        color: "#B2095B",
                        index: "0",
                    },
                    "超夢":{
                        color: "#8810CA",
                        index: "1",
                    },
                    "皮卡丘":{
                        color: "#C4930B",
                        index: "2",
                    }
                }
            },
            packCollapse:[true, true, true],
            searchQuery: "",
            oddsTable:[
                { rarity: 'diamond1', odds: [100, 0, 0] },
                { rarity: 'diamond2', odds: [0, 90, 60] },
                { rarity: 'diamond3', odds: [0, 5, 20] },
                { rarity: 'diamond4', odds: [0, 1.666, 6.664] },
                { rarity: 'star1', odds: [0, 2.572, 10.288] },
                { rarity: 'star2', odds: [0, 0.5, 2] },
                { rarity: 'star3', odds: [0, 0.222, 0.888] },
                { rarity: 'crown', odds: [0, 0.04, 0.16] }
            ],
            isDarkMode: false,
            onlyNotCaptured: false
        };
    },
    mounted() {
        this.init();
        const localCapturedData = JSON.parse(localStorage.getItem('ptcgPocketCaptured'));
        this.captured = this.validateCapturedData(localCapturedData) ? localCapturedData : {"gen1":[]};
    },
    computed: {
        isSmallScreen() {
            return screen.width < 568;
        },
    },
    methods: {
        filteredCards(gen) {
            const filteredCardsObj = JSON.parse(JSON.stringify(this.cards[gen]));
            const obj = {};
            for(const pack of Object.keys(filteredCardsObj)){
                obj[pack] = {};
                Object.keys(filteredCardsObj[pack]).forEach(name => {
                    if (name.includes(this.searchQuery) && ((!this.onlyNotCaptured)||(this.onlyNotCaptured && !this.isCaptured(name, gen)))) {
                        obj[pack][name] = filteredCardsObj[pack][name];
                    }
                });
            }
            return obj;
        },
        triggerCollapsePack(packId){
            this.packCollapse[packId] = this.packCollapse[packId] ? false : true;
        },
        init(){
            for(const cards of gen1Cards){
                this.cards.gen1[cards["pack"]] = this.calculateOdds(this.groupByCardName(cards["card"]), cards["card"])
            }
        },
        calculateOdds(cardsWithRarity, cards){
            let count = {};
            for(const rarity of Object.keys(cards)){
                count[rarity] = cards[rarity].length;
            }
            for(const card of Object.keys(cardsWithRarity)){
                cardsWithRarity[card] = this.calculateSingleCardOdds(cardsWithRarity[card], count);
            }
            return cardsWithRarity;
        },
        calculateSingleCardOdds(card, count){
            let arr = [];
            for(const rarity of card){
                let odds = JSON.parse(JSON.stringify(this.oddsTable.filter(x=> x.rarity === rarity)[0].odds));
                odds = odds.map(x => x / count[rarity]);
                if(arr.length == 0){
                    arr = odds;
                }else {
                    arr = [arr[0] + odds[0], arr[1] + odds[1], arr[2] + odds[2]];
                }
            }
            arr = arr.map(x=> x.toFixed(4).replace(/\.0+$/, ""));
            return arr;
        },
        groupByCardName(data) {
            const result = {};
            Object.keys(data).forEach(rarity=>{
                data[rarity].forEach(card=>{
                    if(result.hasOwnProperty(card)){
                        result[card].push(rarity);
                    }else{
                        result[card] = [rarity];
                    }
                });
            });
            return result;
        },
        isCaptured(name, gen){
            return this.captured && this.captured[gen] && this.captured[gen].includes(name) ? true : false;
        },
        triggerCaptured(name, gen){
            if(this.captured[gen].includes(name)){
                const removed = this.captured[gen].filter(x=>x != name);
                this.captured[gen] = removed && removed.length > 0 ? removed : this.captured[gen];
            }else{
                this.captured[gen].push(name);
            }
            localStorage.setItem('ptcgPocketCaptured', JSON.stringify(this.captured));
        },
        getNotCapturedRate(pack, gen, pos){
            return Object.keys(this.cards[gen][pack]).reduce((acc, card) =>{
                    if(this.isCaptured(card, gen)) acc -= Number(this.cards[gen][pack][card][pos]);
                    return acc;
                }, 100).toFixed(4).replace(/\.0+$/, "");
        },
        copyCaptured(){
            const capturedJSON = JSON.stringify(this.captured);
            navigator.clipboard.writeText(capturedJSON).then(() => {
                alert('已複製到剪貼簿，下次使用時請複製後即可會入');
            }).catch(err => {
                alert('複製至剪貼簿失敗');
            });
        },
        overwriteCaptured(){
            navigator.clipboard.readText().then(text => {
                try {
                    const capturedData = JSON.parse(text);
                    if(!this.validateCapturedData(capturedData)){ throw new Error(text)};
                    this.captured = capturedData;
                    alert('成功覆蓋剪貼簿的內容至目前頁面');
                } catch (error) {
                    alert(`非預期的錯誤或剪貼簿內容不合法，錯誤或目前剪貼簿內容為: ${error}`);
                }
            }).catch(err => {
                alert(`無法讀取剪貼簿，遇到的錯誤為: ${err}`);
            });
        },
        validateCapturedData(capturedData){
            console.log(!capturedData, !capturedData.hasOwnProperty("gen1"), !Array.isArray(capturedData["gen1"]));
            if (!capturedData || !capturedData.hasOwnProperty("gen1") || !Array.isArray(capturedData["gen1"])) {
                return false;
            }
            return true;
        }
    }
});
app.mount('#app');