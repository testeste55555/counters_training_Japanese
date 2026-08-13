(() => {
  "use strict";

  const counterData = {
        tsu: {
          label: "〜つ", question: "いくつ",
          readings: ["ひとつ", "ふたつ", "みっつ", "よっつ", "いつつ", "むっつ", "ななつ", "やっつ", "ここのつ", "とお"],
          items: [
            { key: "apple", name: "りんご", glyphs: ["🍎"], verb: "あります", category: "basic", jobTags: ["common"], acceptedCounters: ["tsu", "ko"] },
            { key: "eraser", name: "けしごむ", draw: "eraser", verb: "あります", category: "basic", jobTags: ["common"], acceptedCounters: ["tsu", "ko"] },
            { key: "bag", name: "かばん", glyphs: ["🎒"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "key", name: "かぎ", glyphs: ["🔑"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "bento", name: "べんとう", glyphs: ["🍱"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "bread", name: "ぱん", glyphs: ["🍞"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "cup", name: "こっぷ", glyphs: ["🥛"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "bag-small", name: "ふくろ", glyphs: ["🛍️"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "box", name: "はこ", glyphs: ["📦"], verb: "あります", category: "work", jobTags: ["common", "manufacturing", "food"] }
          ]
        },
        nin: {
          label: "〜にん", question: "なんにん",
          readings: ["ひとり", "ふたり", "さんにん", "よにん", "ごにん", "ろくにん", "しちにん", "はちにん", "きゅうにん", "じゅうにん"],
          items: [
            { key: "man", name: "おとこのひと", glyphs: ["👨"], verb: "います", category: "basic", jobTags: ["common"] },
            { key: "woman", name: "おんなのひと", glyphs: ["👩"], verb: "います", category: "basic", jobTags: ["common"] },
            { key: "child", name: "こども", glyphs: ["👧", "👦"], verb: "います", category: "life", jobTags: ["common"] },
            { key: "worker", name: "さぎょういん", glyphs: ["👷"], verb: "います", category: "work", jobTags: ["common", "construction", "welding", "manufacturing", "food"] }
          ]
        },
        hon: {
          label: "〜ほん", question: "なんぼん",
          readings: ["いっぽん", "にほん", "さんぼん", "よんほん", "ごほん", "ろっぽん", "ななほん", "はっぽん", "きゅうほん", "じゅっぽん"],
          items: [
            { key: "pencil", name: "えんぴつ", glyphs: ["✏️"], verb: "あります", category: "basic", jobTags: ["common"] },
            { key: "pen", name: "ぺん", glyphs: ["🖊️"], verb: "あります", category: "basic", jobTags: ["common"] },
            { key: "umbrella", name: "かさ", glyphs: ["☂️"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "screwdriver", name: "どらいばー", glyphs: ["🪛"], verb: "あります", category: "work", jobTags: ["common", "construction", "welding", "manufacturing"] },
            { key: "wrench", name: "れんち", glyphs: ["🔧"], verb: "あります", category: "work", jobTags: ["common", "construction", "welding", "manufacturing"] },
            { key: "pipe", name: "ぱいぷ", draw: "pipe", verb: "あります", category: "work", jobTags: ["construction", "welding", "manufacturing"] },
            { key: "broom", name: "ほうき", glyphs: ["🧹"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "bottle", name: "ぼとる", draw: "bottle", verb: "あります", category: "life", jobTags: ["common", "food"] }
          ]
        },
        mai: {
          label: "〜まい", question: "なんまい",
          readings: ["いちまい", "にまい", "さんまい", "よんまい", "ごまい", "ろくまい", "ななまい", "はちまい", "きゅうまい", "じゅうまい"],
          items: [
            { key: "paper", name: "かみ", draw: "paper", verb: "あります", category: "basic", jobTags: ["common"] },
            { key: "towel", name: "たおる", draw: "towel", verb: "あります", category: "life", jobTags: ["common", "care", "food"] },
            { key: "mask", name: "ますく", draw: "mask", verb: "あります", category: "work", jobTags: ["common", "care", "food", "manufacturing"] },
            { key: "shirt", name: "しゃつ", glyphs: ["👕"], verb: "あります", category: "life", jobTags: ["common", "sewing"] },
            { key: "rag", name: "ぞうきん", draw: "rag", verb: "あります", category: "work", jobTags: ["common"] },
            { key: "sheet", name: "しーと", draw: "sheet", verb: "あります", category: "work", jobTags: ["construction", "manufacturing", "food"] },
            { key: "label", name: "らべる", draw: "label", verb: "あります", category: "work", jobTags: ["manufacturing", "food", "sewing"] }
          ]
        },
        hiki: {
          label: "〜ひき", question: "なんびき",
          readings: ["いっぴき", "にひき", "さんびき", "よんひき", "ごひき", "ろっぴき", "ななひき", "はっぴき", "きゅうひき", "じゅっぴき"],
          items: [
            { key: "dog", name: "いぬ", glyphs: ["🐕"], verb: "います", category: "basic", jobTags: ["common"] },
            { key: "cat", name: "ねこ", glyphs: ["🐈"], verb: "います", category: "basic", jobTags: ["common"] },
            { key: "rabbit", name: "うさぎ", glyphs: ["🐇"], verb: "います", category: "basic", jobTags: ["common"] },
            { key: "fish", name: "さかな", glyphs: ["🐟"], verb: "います", category: "life", jobTags: ["common", "food"] },
            { key: "mouse", name: "ねずみ", glyphs: ["🐁"], verb: "います", category: "life", jobTags: ["common"] },
            { key: "frog", name: "かえる", glyphs: ["🐸"], verb: "います", category: "basic", jobTags: ["common"] }
          ]
        },
        dai: {
          label: "〜だい", question: "なんだい",
          readings: ["いちだい", "にだい", "さんだい", "よんだい", "ごだい", "ろくだい", "ななだい", "はちだい", "きゅうだい", "じゅうだい"],
          items: [
            { key: "car", name: "くるま", glyphs: ["🚗"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "bicycle", name: "じてんしゃ", glyphs: ["🚲"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "motorcycle", name: "ばいく", glyphs: ["🏍️"], verb: "あります", category: "life", jobTags: ["common"] },
            { key: "computer", name: "ぱそこん", glyphs: ["💻"], verb: "あります", category: "work", jobTags: ["common"] },
            { key: "fridge", name: "れいぞうこ", draw: "fridge", verb: "あります", category: "life", jobTags: ["common", "food"] },
            { key: "washer", name: "せんたくき", draw: "washer", verb: "あります", category: "life", jobTags: ["common"] },
            { key: "microwave", name: "でんしれんじ", draw: "microwave", verb: "あります", category: "life", jobTags: ["common", "food"] },
            { key: "forklift", name: "ふぉーくりふと", draw: "forklift", verb: "あります", category: "work", jobTags: ["common", "construction", "manufacturing", "food"] }
          ]
        },
        satsu: {
          label: "〜さつ", question: "なんさつ",
          readings: ["いっさつ", "にさつ", "さんさつ", "よんさつ", "ごさつ", "ろくさつ", "ななさつ", "はっさつ", "きゅうさつ", "じゅっさつ"],
          items: [
            { key: "book", name: "ほん", glyphs: ["📖"], verb: "あります", category: "basic", jobTags: ["common"] },
            { key: "notebook", name: "のーと", glyphs: ["📓"], verb: "あります", category: "basic", jobTags: ["common"] },
            { key: "dictionary", name: "じしょ", draw: "dictionary", verb: "あります", category: "basic", jobTags: ["common"] },
            { key: "textbook", name: "きょうかしょ", draw: "textbook", verb: "あります", category: "basic", jobTags: ["common"] },
            { key: "planner", name: "てちょう", draw: "planner", verb: "あります", category: "life", jobTags: ["common"] },
            { key: "manual", name: "まにゅある", draw: "manual", verb: "あります", category: "work", jobTags: ["common", "construction", "welding", "sewing", "food", "manufacturing", "care"] }
          ]
        },
        ko: {
          label: "〜こ", question: "なんこ",
          readings: ["いっこ", "にこ", "さんこ", "よんこ", "ごこ", "ろっこ", "ななこ", "はっこ", "きゅうこ", "じゅっこ"],
          items: [
            { key: "egg", name: "たまご", glyphs: ["🥚"], verb: "あります", category: "life", jobTags: ["common", "food"], acceptedCounters: ["ko", "tsu"] },
            { key: "helmet", name: "へるめっと", draw: "helmet", verb: "あります", category: "work", jobTags: ["common", "construction", "welding", "manufacturing"] },
            { key: "nut", name: "なっと", draw: "nut", verb: "あります", category: "work", jobTags: ["construction", "welding", "manufacturing"] },
            { key: "bucket", name: "ばけつ", glyphs: ["🪣"], verb: "あります", category: "work", jobTags: ["common", "construction", "manufacturing", "food"] },
            { key: "tape-measure", name: "めじゃー", draw: "tape", verb: "あります", category: "work", jobTags: ["common", "construction", "welding", "manufacturing"] },
            { key: "button", name: "ぼたん", draw: "button", verb: "あります", category: "work", jobTags: ["sewing", "manufacturing"] }
          ]
        }
      }

  window.CounterTrainingData = Object.freeze({ counterData });
})();
