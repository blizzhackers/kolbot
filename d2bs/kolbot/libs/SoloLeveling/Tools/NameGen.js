/*
*	@filename	NameGen.js
*	@author		isid0re
*	@desc		Creates character names by combining a Descriptive Adjective + Noun
*/

var NameGen = function () {
	var adjectives = [
		"Ancient", "Angry", "Artful", "Able", "Abundant", "Accepting", "Acclaimed", "Active", "Addictive", "Adept", "Adequate", "Admired", "Adorable",
		"Adored", "Agile", "Amazing", "Amiable", "Amicable", "Amusing", "Anxious", "Anxious", "Apathetic", "Aquatic", "Arrogant", "Artistic",
		"Attentive", "Awesome", "Azure", "Barren", "Bitter", "Black", "Blue", "Blasted", "Bold", "Bonding", "Boorish", "Bountiful", "Braggart",
		"Brave", "Bright", "Brilliant", "Broken", "Burning", "Busy", "Buzzing", "Callous", "Captious", "Caring", "Cautious", "Celestial",
		"Changing", "Charming", "Chaste", "Cheating", "Cheerful", "Churlish", "Civil", "Clean", "Clever", "Coastal", "Cold", "Colossal",
		"Composed", "Concerned", "Concrete", "Complex", "Cheap", "Compact", "Confident", "Congenial", "Cordial", "Courteous", "Covetous", "Crazy",
		"Crazed", "Creative", "Crimson", "Critical", "Crossing", "Crucial", "Crude", "Crushing", "Culpable", "Curious", "Current", "Curt", "Cynical",
		"Dancing", "Dark", "Decent", "Decorous", "Defensive", "Deft", "Dejected", "Delirious", "Demanding", "Demeaning", "Demise", "Depressed",
		"Devious", "Devoted", "Diligent", "Discreet", "Diving", "Dishonest", "Docile", "Downcast", "Doubting", "Drunken", "Dry", "Dull", "Dutiful",
		"Dynamic", "Eager", "Earnest", "Earthy", "East", "Efficient", "Elegant", "Elitist", "Emerald", "Endemic", "Energetic", "Enigmatic", "Esteemed",
		"Estimable", "Ethical", "Euphoric", "Evergreen", "Exclusive", "Expectant", "Explosive", "Exquisite", "Exuberant", "Endless", "Fair", "Faithful",
		"False", "Famous", "Fancy", "Fat", "Fatal", "Festive", "Feral", "Ferocious", "Fertile", "Fervent", "Funky", "Fibrous", "Fierce", "Firm",
		"Flawless", "Flexible", "Flowing", "Focused", "Forgiving", "Forlorn", "Frail", "Fierce", "Flustered", "Flying", "Foolish", "Friendly",
		"Generous", "Genial", "Genteel", "Gentle", "Genuine", "Gifted", "Gigantic", "Glib", "Gloomy", "Golden", "Good", "Gorgeous", "Graceful",
		"Gracious", "Grand", "Grateful", "Gravity", "Green", "Grouchy", "Guilty", "Guilty", "Gusty", "Grim", "Green", "Greedy", "Handsome", "Handy",
		"Hard", "Happy", "Haunting", "Healing", "Headless", "Heavenly", "Heroic", "Hidden", "High", "Honest", "Honorable", "Hopeful", "Hostile",
		"Humane", "Humble", "Humorous", "Hungry", "Hygienic", "Idolize", "Ignoble", "Ignorant", "Impartial", "Impolite", "Improper", "Imprudent",
		"Impudent", "Indecent", "Infinite", "Ingenuous", "Innocent", "Insolent", "Insulting", "Intense", "Introvert", "Intuitive", "Inventive",
		"Irascible", "Intrepid", "Jade", "Janky", "Jaundiced", "Jealous", "Jealous", "Jocular", "Jolly", "Jovial", "Juicy", "Joyful", "Jubilant",
		"Just", "Juvenile", "Kingly", "Keen", "Kind", "Kindred", "Kooky", "Liberal", "Listening", "Loathsome", "Loving", "LOYAL", "Limp", "Lord",
		"Loud", "Light", "Little", "Lanky", "Lazy", "Long", "Lucky", "Last", "Leaping", "Lone", "Lonely", "Lost", "Magical", "Majestic", "Malicious",
		"Mammoth", "Marine", "Masterful", "Meddling", "Migratory", "Minuscule", "Miserable", "Misty", "Modest", "Moral", "Mediocre", "Mellow", "Mute",
		"Miserable", "Naive", "Nascent", "Native", "Natural", "Natures", "Needy", "Nefarious", "Negative", "Neglected", "Negligent", "Nice", "Noble",
		"Northern", "Notorious", "Obedient", "Observant", "Open", "Orderly", "Original", "Outspoken", "Organic", "Ornate", "Ordinary", "Orange",
		"Parasitic", "Partial", "Patient", "Personal", "Petulant", "Pleasant", "Poise", "Polite", "Pollutant", "Popular", "Pouncing", "Powerful",
		"Prideful", "Primal", "Prime", "Pristine", "Prompt", "Proper", "Punctual", "Pure", "Purple", "Putrid", "Practical", "Precious", "Puzzled",
		"Quaint", "Quick", "Quiet", "Quirky", "Radiant", "Raging", "Rancorous", "Regular", "Red", "Rancid", "Rough", "Rational", "Reckless", "Refined",
		"Regal", "Renewable", "Repugnant", "Resilient", "Resolute", "Reverent", "Rotting", "Ruby", "Rude", "Ruthless", "Sad", "Safe", "Savage",
		"Scorching", "Scornful", "Secret", "Selfish", "Sensible", "Sensitive", "Sharing", "Silver", "Simple", "Sober", "Solar", "Solemn", "Solitary",
		"Southern", "Sour", "Spatial", "Special", "Splendid", "Staunch", "Singing", "Stern", "Stunning", "Subtle", "Sullen", "Superb", "Superior",
		"Surly", "Sweet", "Strong", "Smart", "Short", "Skinny", "Stupid", "Salty", "Soft", "Smooth", "Sharp", "Sneaky", "Stinky", "Tactful", "Tainted",
		"Temperate", "Temperate", "Tenacious", "Terrible", "Terrific", "Testy", "Tolerant", "Towering", "Toxic", "Tropical", "True", "Truthful", "Tasty",
		"Tricky", "Ultimate", "Ultimate", "Uncivil", "Uncouth", "Unethical", "Unfair", "Unique", "United", "Unfit", "Unrefined", "Unsavory", "Unworthy",
		"Uplifting", "Upright", "Uprooted", "Valiant", "Veracious", "Versatile", "Vicious", "Vigilant", "Vigilant", "Vigorous", "Vile", "Virtuous",
		"Visible", "Vivacious", "Vocal", "Volatile", "Violent", "Violet", "Void", "Weak", "West", "White", "Willful", "Wet", "Warm", "Wary", "Watchful",
		"Weeping", "Wicked", "Wild", "Willing", "Winning", "Winsome", "Wise", "Wistful", "Witty", "Woeful", "Wonderful", "Worldwide", "Wretched",
		"Worthy", "Yellow", "Yearning", "Yielding", "Yielding", "Yourself", "Youthful", "Zany", "Zealot", "Zealous", "Zealous", "Zero",
	];

	var nouns = [
		"glue", "riot", "boom", "veil", "poet", "hype", "cafe", "gene", "fame", "sin", "zon", "barb", "core", "dust", "bite", "maid", "scar",
		"wing", "horn", "crew", "lake", "duke", "mask", "dawn", "seed", "tank", "flag", "jazz", "tart", "brew", "meow", "boot", "shoe", "sage", "drum",
		"babe", "cash", "luck", "lime", "eyes", "boat", "milk", "tuna", "cube", "oreo", "worm", "rage", "itch", "four", "bomb", "pear", "ship", "oven",
		"fear", "hate", "leaf", "hero", "wife", "bean", "hope", "girl", "baby", "meme", "wish", "one", "nine", "work", "cake", "lady", "fire", "pain",
		"rain", "fool", "soul", "tree", "five", "fish", "love", "life", "elk", "dad", "hog", "elf", "mop", "rod", "bat", "bug", "bot", "pus", "ufo",
		"zen", "ark", "rag", "egg", "bed", "car", "boy", "man", "cricket", "aura", "moon", "hippo", "vortex", "palm", "panther", "meteor", "deer",
		"vein", "plan", "atom", "hole", "weed", "boss", "army", "meat", "lock", "song", "rat", "rose", "blossom", "twin", "comet", "fist", "crow",
		"star", "starlight", "axe", "fury", "mouse", "blow", "swan", "bee", "asp", "viper", "feather", "bird", "bolt", "sun", "mind", "beaver", "frog",
		"mist", "day", "night", "falcon", "blood", "poison", "lily", "inferno", "kiss", "lotus", "giant", "monarch", "lord", "autumn", "spring",
		"summer", "winter", "paragon", "vulture", "condor", "coil", "chain", "spell", "dove", "peach", "petal", "droplet", "eruption", "heaven", "fog",
		"boa", "needle", "shield", "rock", "turtle", "ghost", "death", "cobra", "bane", "princess", "king", "fingers", "toes", "hand", "foot", "ear",
		"eye", "skull", "cat", "dog", "pig", "piggy", "cow", "snake", "horse", "rabbit", "goat", "wolf", "sheep", "duck", "eagle", "crab", "baboon", "basilisk",
		"fox", "badger", "beetle", "butterfly", "shark", "clownfish", "crane", "cicada", "dingo", "elephant", "jackal", "jaguar", "lion", "mandrill",
		"lungfish", "heart", "spleen", "liver", "guts", "brains", "bones", "chocolate", "candy", "surprise", "cheese", "furball", "salami", "beef",
		"supreme", "taco", "burger", "hotdog", "carrot", "onion", "fungus", "brick", "rock", "banana", "killer", "demon", "angel", "saint", "bamboo",
		"panda", "broom", "hammer", "snow", "cur", "toad", "raven", "claw", "pine", "rice", "sushi", "bread", "toast", "cereal", "smoke", "fart",
		"beer", "bear", "faucet", "pipe", "iron", "dork", "genius", "hunter", "farmer", "wiz", "witch", "churro", "donut", "shrimp", "sand", "pagoda",
		"eel", "ant", "pants", "jeans", "socks", "sword", "fork", "pizza", "trap", "pork", "wort", "sack", "hawk", "rite", "tire", "dirt", "plum",
	];

	let random1 = Math.floor(Math.random() * (adjectives.length + 1));
	let list2Limit = 16 - adjectives[random1].length;
	let list2 = nouns.filter(function (element) {
		return element.length < list2Limit;
	});

	let random2 = Math.floor(Math.random() * (list2.length + 1));
	let namechosen = adjectives[random1].toLowerCase() + list2[random2].toLowerCase();

	return namechosen;
};
