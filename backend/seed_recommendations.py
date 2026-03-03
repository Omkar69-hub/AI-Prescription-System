"""
seed_recommendations.py
Populates the 'recommendations' collection with 50+ medical conditions.
Run: python seed_recommendations.py
"""
import os, sys
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(".env")
client = MongoClient(os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017"))
db = client[os.getenv("DATABASE_NAME", "ai_prescription")]

RECOMMENDATIONS = [
    # ── Respiratory ──────────────────────────────────────────────────────────
    {
        "condition": "Common Cold",
        "symptoms": ["runny nose", "sneezing", "nasal congestion", "sore throat", "common cold", "cold"],
        "description": "A mild viral infection of the upper respiratory tract. Symptoms usually resolve within 7–10 days.",
        "diet": "Stay well-hydrated with warm soups, herbal teas, and plenty of water. Include citrus fruits rich in Vitamin C. Avoid cold drinks.",
        "workout": "Rest is essential. Avoid strenuous activity. Light stretching or slow walks are fine if you feel up to it.",
        "medicines": [
            {"brand": "Cetirizine", "generic": "Cetirizine Hydrochloride", "dosage": "10mg once daily", "timing": "At night before bed"},
            {"brand": "Nasoclear", "generic": "Saline Nasal Spray", "dosage": "2 sprays per nostril", "timing": "3 times daily as needed"},
        ]
    },
    {
        "condition": "Viral Fever",
        "symptoms": ["fever", "high temperature", "body temperature", "chills", "shivering", "hot forehead", "sweating with fever"],
        "description": "Fever is most commonly caused by a viral infection. The immune system raises body temperature to fight pathogens.",
        "diet": "Eat light, easily digestible foods like khichdi, soup, and rice. Drink plenty of fluids including ORS, coconut water, and warm water.",
        "workout": "Complete rest. No exercise until fever subsides for 24 hours.",
        "medicines": [
            {"brand": "Crocin 650", "generic": "Paracetamol 650mg", "dosage": "1 tablet every 6 hours", "timing": "After meals - do not exceed 4 tablets/day"},
            {"brand": "Dolo 650", "generic": "Paracetamol 650mg", "dosage": "1 tablet every 6–8 hours", "timing": "After meals when fever is above 38°C"},
        ]
    },
    {
        "condition": "Dry Cough",
        "symptoms": ["dry cough", "tickle in throat", "throat irritation", "persistent cough", "night cough"],
        "description": "A dry, non-productive cough often caused by viral infection, allergies, or throat irritation.",
        "diet": "Honey in warm water or warm milk soothes the throat. Avoid cold beverages and spicy foods.",
        "workout": "Avoid exercise that worsens coughing. Rest and humidified air help recovery.",
        "medicines": [
            {"brand": "Benadryl", "generic": "Diphenhydramine + Ammonium Chloride", "dosage": "10ml syrup", "timing": "3 times daily after meals"},
            {"brand": "Honitus", "generic": "Honey-based Cough Syrup (Ayurvedic)", "dosage": "2 teaspoons", "timing": "3 times daily"},
        ]
    },
    {
        "condition": "Wet / Productive Cough",
        "symptoms": ["wet cough", "phlegm", "mucus cough", "coughing up mucus", "chest congestion", "productive cough"],
        "description": "Cough with mucus production, often indicating a respiratory infection or bronchitis.",
        "diet": "Warm soups and broths help loosen phlegm. Ginger tea, turmeric milk, and adequate fluid intake are beneficial.",
        "workout": "Rest until phlegm production reduces. Steam inhalation helps clear airways.",
        "medicines": [
            {"brand": "Mucinex", "generic": "Guaifenesin 600mg", "dosage": "1 tablet every 12 hours", "timing": "With a full glass of water"},
            {"brand": "Alex", "generic": "Dextromethorphan + Guaifenesin", "dosage": "10ml syrup", "timing": "Every 6–8 hours"},
        ]
    },
    {
        "condition": "Asthma / Wheezing",
        "symptoms": ["asthma", "wheezing", "breathlessness", "shortness of breath", "tight chest", "cannot breathe", "difficulty breathing", "wheeze"],
        "description": "Chronic airway inflammation causing reversible airflow obstruction. Triggers include allergens, exercise, and cold air.",
        "diet": "Anti-inflammatory foods like berries, leafy greens, and omega-3 rich fish. Avoid sulfite-rich foods (wine, dried fruits).",
        "workout": "Avoid cold, dry air and high-intensity exercise. Warm-up properly. Carry rescue inhaler during exercise.",
        "medicines": [
            {"brand": "Asthalin Inhaler", "generic": "Salbutamol 100mcg", "dosage": "2 puffs as needed", "timing": "During breathlessness / before exercise"},
            {"brand": "Budecort Inhaler", "generic": "Budesonide 200mcg", "dosage": "1 puff twice daily", "timing": "Morning and night (controller inhaler)"},
        ]
    },
    {
        "condition": "Sore Throat / Pharyngitis",
        "symptoms": ["sore throat", "throat pain", "painful swallowing", "swollen throat", "pharyngitis", "throat infection", "difficulty swallowing"],
        "description": "Inflammation of the throat (pharynx) typically caused by viral or bacterial infection.",
        "diet": "Warm liquids like honey-lemon tea, warm water with salt gargles. Avoid cold, hard, or spicy foods.",
        "workout": "Rest voice. Light activity is okay if fever-free.",
        "medicines": [
            {"brand": "Strepsils", "generic": "Amylmetacresol + Dichlorobenzyl Alcohol", "dosage": "1 lozenge every 3 hours", "timing": "Up to 8 lozenges per day"},
            {"brand": "Betadine Gargle", "generic": "Povidone Iodine 1% Gargle", "dosage": "Gargle 30ml undiluted", "timing": "Twice daily for up to 7 days"},
        ]
    },
    # ── Headache / Neurological ───────────────────────────────────────────────
    {
        "condition": "Tension Headache",
        "symptoms": ["headache", "head pain", "tension headache", "pressure headache", "band around head", "head ache", "head hurts"],
        "description": "Most common type of headache — dull pressure or tightness around the forehead and back of the neck.",
        "diet": "Stay hydrated. Magnesium-rich foods (almonds, spinach) may help prevent headaches. Limit caffeine and alcohol.",
        "workout": "Light walking, yoga, and neck stretches can relieve tension headaches. Avoid screens for extended periods.",
        "medicines": [
            {"brand": "Combiflam", "generic": "Ibuprofen 400mg + Paracetamol 325mg", "dosage": "1 tablet", "timing": "After meals, up to 3 times/day"},
            {"brand": "Saridon", "generic": "Propyphenazone 150mg + Caffeine 50mg + Paracetamol 250mg", "dosage": "1–2 tablets", "timing": "At onset of headache, after meals"},
        ]
    },
    {
        "condition": "Migraine",
        "symptoms": ["migraine", "severe headache", "throbbing headache", "one side headache", "headache with nausea", "light sensitivity", "sound sensitivity", "aura headache"],
        "description": "Recurring moderate-to-severe headaches often accompanied by nausea, vomiting, and sensitivity to light/sound.",
        "diet": "Keep a migraine food diary. Avoid common triggers: aged cheese, red wine, caffeine, MSG. Eat regularly and stay hydrated.",
        "workout": "Avoid exercise during an attack. Regular aerobic exercise (3x/week) may reduce frequency when not in an attack.",
        "medicines": [
            {"brand": "Suminat", "generic": "Sumatriptan 50mg", "dosage": "1 tablet at onset", "timing": "May repeat after 2 hours if needed (max 2 tablets/day)"},
            {"brand": "Vasograin", "generic": "Ergotamine + Caffeine + Paracetamol", "dosage": "1 tablet at onset", "timing": "At first sign of migraine (after meals)"},
        ]
    },
    {
        "condition": "Vertigo / Dizziness",
        "symptoms": ["vertigo", "dizziness", "spinning sensation", "balance problem", "room spinning", "dizzy", "lightheaded", "feel dizzy", "feel lightheaded"],
        "description": "A sensation of spinning or loss of balance, often caused by inner ear problems (BPPV) or low blood pressure.",
        "diet": "Reduce salt intake to manage fluid in the inner ear. Stay well-hydrated. Limit caffeine and alcohol.",
        "workout": "Avoid sudden head movements. Vestibular rehabilitation exercises (Epley maneuver for BPPV) can help.",
        "medicines": [
            {"brand": "Stemetil", "generic": "Prochlorperazine 5mg", "dosage": "5–10mg", "timing": "3 times daily as needed for acute dizziness"},
            {"brand": "Vertin", "generic": "Betahistine 16mg", "dosage": "1 tablet", "timing": "3 times daily with meals"},
        ]
    },
    # ── Digestive / GI ────────────────────────────────────────────────────────
    {
        "condition": "Acid Reflux / GERD",
        "symptoms": ["heartburn", "acid reflux", "acidity", "burning chest", "burping", "gerd", "stomach burning", "indigestion", "sour taste", "bloating"],
        "description": "Acid from stomach flows back into the food pipe, causing a burning sensation in the chest and throat.",
        "diet": "Eat smaller, frequent meals. Avoid spicy, fatty, and acidic foods. No eating 2–3 hours before bedtime. Elevate bed head.",
        "workout": "Light walking after meals. Avoid exercising on a full stomach. Yoga poses that compress the abdomen worsen reflux.",
        "medicines": [
            {"brand": "Pan-D", "generic": "Pantoprazole 40mg + Domperidone 30mg", "dosage": "1 capsule", "timing": "30 minutes before breakfast daily"},
            {"brand": "Gelusil MPS", "generic": "Magaldrate + Simethicone Suspension", "dosage": "10ml", "timing": "30 minutes after meals and at bedtime"},
        ]
    },
    {
        "condition": "Diarrhea / Loose Motions",
        "symptoms": ["diarrhea", "loose motion", "loose stool", "watery stool", "frequent stools", "stomach loose", "running stomach", "loose potty"],
        "description": "Frequent, loose, or watery stools often caused by infection, food poisoning, or irritable bowel.",
        "diet": "BRAT diet: Bananas, Rice, Applesauce, Toast. Drink ORS to replace electrolytes. Avoid dairy, greasy, and spicy foods.",
        "workout": "Rest completely. Resume light activity only after 24 hours free of symptoms.",
        "medicines": [
            {"brand": "ORS Sachet (Electral)", "generic": "Oral Rehydration Salts", "dosage": "1 sachet dissolved in 1L water", "timing": "Sip frequently throughout the day"},
            {"brand": "Imosec", "generic": "Loperamide 2mg", "dosage": "2 capsules initially, then 1 after each loose stool", "timing": "Max 8 capsules per day — not for children under 12"},
        ]
    },
    {
        "condition": "Constipation",
        "symptoms": ["constipation", "hard stool", "no bowel movement", "difficulty passing stool", "no motions", "straining to defecate", "blocked bowel"],
        "description": "Infrequent bowel movements or difficulty passing stools, typically defined as fewer than 3 times per week.",
        "diet": "High-fiber foods: fruits, vegetables, whole grains, legumes. Drink 8–10 glasses of water daily. Prune juice is a natural laxative.",
        "workout": "Regular aerobic exercise (walking, cycling) stimulates bowel movement. Morning exercise is especially helpful.",
        "medicines": [
            {"brand": "Cremaffin", "generic": "Liquid Paraffin + Milk of Magnesia Suspension", "dosage": "15–30ml", "timing": "At bedtime"},
            {"brand": "Duphalac", "generic": "Lactulose 10g/15ml Syrup", "dosage": "15–45ml", "timing": "Once daily, adjust dose for soft stool"},
        ]
    },
    {
        "condition": "Nausea / Vomiting",
        "symptoms": ["nausea", "vomiting", "feeling sick", "want to vomit", "throwing up", "queasiness", "upset stomach", "motion sickness"],
        "description": "Unpleasant sensation in the stomach with an urge to vomit, caused by infections, motion sickness, or medications.",
        "diet": "Eat small, bland, frequent meals (crackers, toast, rice). Ginger tea helps. Avoid strong odors and greasy/spicy foods.",
        "workout": "Rest and avoid activity during active nausea. Sit upright and avoid lying flat immediately after eating.",
        "medicines": [
            {"brand": "Ondem", "generic": "Ondansetron 4mg", "dosage": "1 tablet", "timing": "Every 8 hours for nausea/vomiting"},
            {"brand": "Perinorm", "generic": "Metoclopramide 10mg", "dosage": "1 tablet", "timing": "30 minutes before meals, 3 times daily"},
        ]
    },
    {
        "condition": "Food Poisoning / Gastroenteritis",
        "symptoms": ["food poisoning", "stomach infection", "gastroenteritis", "stomach flu", "vomiting and diarrhea", "cramps with diarrhea", "stomach cramps with loose motion"],
        "description": "Illness caused by consuming contaminated food or water. Symptoms include vomiting, diarrhea, and stomach cramps.",
        "diet": "Fast for first 1–2 hours if unable to keep food down. Then start clear liquids (ORS, clear broth). Gradual return to BRAT diet.",
        "workout": "Complete rest. No physical activity until 24 hours symptom-free.",
        "medicines": [
            {"brand": "Electral ORS", "generic": "Oral Rehydration Salts", "dosage": "1 sachet per litre of water", "timing": "Sip every 15–20 minutes"},
            {"brand": "Metrogyl", "generic": "Metronidazole 400mg", "dosage": "1 tablet 3 times daily for 5–7 days", "timing": "After meals (if bacterial infection confirmed — consult doctor)"},
        ]
    },
    {
        "condition": "Stomach Cramps / Abdominal Pain",
        "symptoms": ["stomach ache", "abdominal pain", "stomach cramps", "stomach pain", "belly pain", "tummy ache", "lower abdominal pain", "abdominal cramps"],
        "description": "Pain in the abdomen can range from mild cramping (gas) to severe pain requiring immediate attention.",
        "diet": "Light, easy-to-digest meals. Warm water with fennel seeds helps relieve gas cramps. Avoid spicy, fatty, or fried foods.",
        "workout": "Rest until pain resolves. Gentle walking may help gas-related cramps.",
        "medicines": [
            {"brand": "Meftal Spas", "generic": "Mefenamic Acid + Dicyclomine", "dosage": "1 tablet", "timing": "3 times daily after meals"},
            {"brand": "Buscopan", "generic": "Hyoscine Butylbromide 10mg", "dosage": "1–2 tablets", "timing": "Up to 4 times daily for cramping"},
        ]
    },
    # ── Pain ─────────────────────────────────────────────────────────────────
    {
        "condition": "Back Pain / Lumbago",
        "symptoms": ["back pain", "lower back pain", "backache", "lumbago", "back hurts", "spinal pain", "lumbar pain", "stiff back"],
        "description": "Pain in the lower back, often caused by muscle strain, poor posture, disc issues, or arthritis.",
        "diet": "Anti-inflammatory foods: turmeric, ginger, cherries, leafy greens. Calcium and Vitamin D for bone health.",
        "workout": "Core strengthening exercises, swimming, and walking. Avoid heavy lifting. Physical therapy is highly beneficial.",
        "medicines": [
            {"brand": "Voveran SR", "generic": "Diclofenac Sodium 100mg SR", "dosage": "1 tablet daily", "timing": "After meals (sustained release — do not crush)"},
            {"brand": "Myospaz", "generic": "Chlorzoxazone + Paracetamol", "dosage": "1 tablet 3 times daily", "timing": "After meals for muscle spasm relief"},
        ]
    },
    {
        "condition": "Joint Pain / Arthritis",
        "symptoms": ["joint pain", "arthritis", "knee pain", "swollen joints", "stiff joints", "painful joints", "hip pain", "shoulder pain", "joint swelling"],
        "description": "Pain, stiffness, and swelling in one or more joints. Osteoarthritis and rheumatoid arthritis are most common types.",
        "diet": "Omega-3 fatty acids (fish, flaxseed), antioxidants, turmeric milk. Maintain healthy weight to reduce joint stress.",
        "workout": "Low-impact exercises: swimming, cycling, yoga. Avoid high-impact activities. Physical therapy helps preserve mobility.",
        "medicines": [
            {"brand": "Etoshine", "generic": "Etoricoxib 90mg", "dosage": "1 tablet daily", "timing": "With or without food (max 7 days)"},
            {"brand": "Osteofos-70", "generic": "Alendronate 70mg (for osteoporosis)", "dosage": "1 tablet weekly", "timing": "First thing in morning with plain water — remain upright for 30 min"},
        ]
    },
    {
        "condition": "Muscle Pain / Myalgia",
        "symptoms": ["muscle pain", "muscle ache", "body aches", "body pain", "myalgia", "sore muscles", "muscle soreness", "muscle cramps"],
        "description": "Diffuse muscle pain often caused by overexertion, viral illness, stress, or dehydration.",
        "diet": "Adequate protein for muscle repair. Potassium (bananas) and magnesium (nuts) for cramps. Stay well-hydrated.",
        "workout": "Rest affected muscles. Light stretching, warm bath, and heat therapy. Gradual return to activity.",
        "medicines": [
            {"brand": "Combiflam", "generic": "Ibuprofen 400mg + Paracetamol 325mg", "dosage": "1 tablet every 8 hours", "timing": "After meals for up to 3 days"},
            {"brand": "Moov Pain Relief Gel", "generic": "Diclofenac 1% Topical Gel", "dosage": "Apply a thin layer", "timing": "3–4 times daily on affected area"},
        ]
    },
    # ── Mental Health ─────────────────────────────────────────────────────────
    {
        "condition": "Anxiety / Panic Disorder",
        "symptoms": ["anxiety", "panic attack", "panic", "anxious", "nervousness", "excessive worry", "racing heart with anxiety", "sweating with anxiety", "palpitations with anxiety", "fear", "phobia"],
        "description": "Persistent excessive worry or sudden episodes of intense fear (panic attacks) with physical symptoms like racing heart and trembling.",
        "diet": "Reduce caffeine and sugar. Include magnesium-rich foods (dark chocolate, avocado). Omega-3 and B-vitamin rich foods support brain health.",
        "workout": "Regular aerobic exercise is one of the most effective anxiety reducers. Yoga and mindfulness breathing are highly beneficial.",
        "medicines": [
            {"brand": "Alprax 0.25", "generic": "Alprazolam 0.25mg", "dosage": "0.25–0.5mg", "timing": "As prescribed — up to 3 times daily (short-term use only, consult psychiatrist)"},
            {"brand": "Nexito 5", "generic": "Escitalopram 5mg", "dosage": "5–10mg once daily", "timing": "In the morning — takes 2–4 weeks for full effect (consult psychiatrist)"},
        ]
    },
    {
        "condition": "Depression",
        "symptoms": ["depression", "sad", "low mood", "hopeless", "worthless", "loss of interest", "no motivation", "crying often", "depressed", "anhedonia"],
        "description": "Persistent feelings of sadness, hopelessness, and loss of interest in activities, affecting daily functioning.",
        "diet": "Mediterranean diet supports mental health. Omega-3 (fish), folate (leafy greens), and B12 are especially important.",
        "workout": "Regular exercise (30 min/day) is as effective as medication for mild/moderate depression. Start small — even a 10-minute walk helps.",
        "medicines": [
            {"brand": "Cipramil", "generic": "Citalopram 20mg", "dosage": "1 tablet daily", "timing": "Morning — takes 4–6 weeks for full effect (must consult psychiatrist)"},
            {"brand": "Sertraline", "generic": "Sertraline 50mg", "dosage": "1 tablet daily", "timing": "With food in morning or evening (consult psychiatrist)"},
        ]
    },
    {
        "condition": "Insomnia / Sleep Disorder",
        "symptoms": ["insomnia", "cannot sleep", "sleep problem", "difficulty sleeping", "waking up at night", "restless sleep", "not sleeping", "trouble sleeping", "sleeplessness"],
        "description": "Persistent difficulty falling or staying asleep, leading to daytime fatigue and impaired functioning.",
        "diet": "Warm milk, chamomile tea, and tart cherry juice support sleep. Avoid caffeine after 2pm and heavy meals at night.",
        "workout": "Regular daytime exercise improves sleep quality. Avoid vigorous exercise within 2–3 hours of bedtime.",
        "medicines": [
            {"brand": "Atarax", "generic": "Hydroxyzine 25mg", "dosage": "25–50mg", "timing": "30 minutes before bedtime (short-term use)"},
            {"brand": "Melatonin", "generic": "Melatonin 3mg", "dosage": "1–3mg", "timing": "30–60 minutes before desired sleep time"},
        ]
    },
    {
        "condition": "Stress / Burnout",
        "symptoms": ["stress", "burnout", "overwhelmed", "exhaustion", "mental fatigue", "concentration problem", "stressed out", "work stress", "tension", "nervous breakdown"],
        "description": "A state of chronic stress that can lead to physical, emotional, and mental exhaustion affecting quality of life.",
        "diet": "Adaptogenic foods: ashwagandha tea, dark chocolate, green tea. B-vitamins and magnesium support nervous system.",
        "workout": "Daily walks, yoga, and deep breathing exercises. Limit screen time. Practice mindfulness 10 minutes daily.",
        "medicines": [
            {"brand": "Ashwagandha (Himalaya)", "generic": "Withania Somnifera Extract 300mg", "dosage": "1 capsule twice daily", "timing": "After meals (natural adaptogen — safe for long-term use)"},
            {"brand": "Rejoint", "generic": "Magnesium Glycinate 400mg", "dosage": "1 tablet daily", "timing": "At bedtime"},
        ]
    },
    # ── Allergy / Skin ────────────────────────────────────────────────────────
    {
        "condition": "Allergic Rhinitis / Hay Fever",
        "symptoms": ["allergic rhinitis", "hay fever", "allergy", "allergic sneezing", "runny nose allergy", "watery eyes", "itchy nose", "nasal allergy"],
        "description": "An allergic response causing sneezing, runny nose, itchy eyes, and nasal congestion triggered by allergens.",
        "diet": "Quercetin-rich foods (apples, onions, green tea) act as natural antihistamines. Local honey may help seasonal allergies.",
        "workout": "Exercise indoors on high pollen days. Shower after outdoor exercise to remove pollen.",
        "medicines": [
            {"brand": "Allegra", "generic": "Fexofenadine 120mg", "dosage": "1 tablet daily", "timing": "Morning before breakfast (non-drowsy)"},
            {"brand": "Montair LC", "generic": "Montelukast 10mg + Levocetirizine 5mg", "dosage": "1 tablet daily", "timing": "At night (may cause drowsiness)"},
        ]
    },
    {
        "condition": "Skin Allergy / Urticaria (Hives)",
        "symptoms": ["skin allergy", "hives", "urticaria", "skin rash", "itchy skin", "rash", "skin itch", "itching", "red patches on skin", "skin inflammation"],
        "description": "Allergic skin reaction causing raised, red, itchy welts (hives) triggered by food, drugs, or environmental allergens.",
        "diet": "Avoid identified trigger foods. Keep a food diary. Anti-inflammatory diet with fruits and vegetables.",
        "workout": "Avoid excessive heat and sweat which can trigger hives. Cool showers soothe acute itching.",
        "medicines": [
            {"brand": "Avil", "generic": "Pheniramine Maleate 25mg", "dosage": "1 tablet", "timing": "2–3 times daily (causes drowsiness)"},
            {"brand": "Zyrtec", "generic": "Cetirizine 10mg", "dosage": "1 tablet daily", "timing": "Night (mildly sedating)"},
        ]
    },
    {
        "condition": "Eczema / Atopic Dermatitis",
        "symptoms": ["eczema", "dry itchy skin", "atopic dermatitis", "scaly skin", "cracked skin", "skin peeling", "flaky skin", "inflamed skin"],
        "description": "A chronic inflammatory skin condition causing dry, itchy, and inflamed skin, often triggered by allergens or stress.",
        "diet": "Avoid common triggers: dairy, gluten, eggs, soy. Include probiotics and Omega-3 fatty acids. Stay well-hydrated.",
        "workout": "Shower immediately after sweating. Wear breathable cotton fabrics. Avoid extremely hot showers.",
        "medicines": [
            {"brand": "Betnovate-C Cream", "generic": "Betamethasone + Clioquinol Cream", "dosage": "Apply thin layer", "timing": "Twice daily for up to 2 weeks — consult dermatologist"},
            {"brand": "CeraVe Moisturizing Cream", "generic": "Ceramides + Hyaluronic Acid Moisturizer", "dosage": "Apply liberally", "timing": "2–3 times daily and after bathing"},
        ]
    },
    # ── Eye ───────────────────────────────────────────────────────────────────
    {
        "condition": "Conjunctivitis (Pink Eye)",
        "symptoms": ["pink eye", "red eye", "conjunctivitis", "eye discharge", "eye infection", "watery eyes", "eye redness", "sticky eye"],
        "description": "Inflammation of the transparent membrane lining the eyelid, often caused by infection or allergy.",
        "diet": "No specific dietary requirement. Good hygiene and frequent handwashing are critical to prevent spread.",
        "workout": "Avoid swimming pools and contact sports until symptoms resolve. Do not share towels or pillowcases.",
        "medicines": [
            {"brand": "Moxiflox Eye Drops", "generic": "Moxifloxacin 0.5% Eye Drops", "dosage": "1–2 drops per eye", "timing": "3 times daily for 7 days (bacterial)"},
            {"brand": "Alocril Eye Drops", "generic": "Nedocromil 2% Eye Drops", "dosage": "1–2 drops per eye", "timing": "Twice daily (for allergic conjunctivitis)"},
        ]
    },
    # ── Cardiovascular ────────────────────────────────────────────────────────
    {
        "condition": "High Blood Pressure / Hypertension",
        "symptoms": ["high blood pressure", "hypertension", "bp high", "elevated blood pressure", "headache with high bp", "elevated bp"],
        "description": "Persistently elevated blood pressure (>140/90 mmHg) that increases the risk of heart disease and stroke.",
        "diet": "DASH diet: fruits, vegetables, whole grains, low-fat dairy, lean protein. Reduce sodium to <2300mg/day. Limit alcohol.",
        "workout": "Regular moderate aerobic exercise (30 min/day, 5 days/week): brisk walking, swimming, cycling.",
        "medicines": [
            {"brand": "Telmikind-AM", "generic": "Telmisartan 40mg + Amlodipine 5mg", "dosage": "1 tablet daily", "timing": "Morning (once daily — do not stop without consulting doctor)"},
            {"brand": "Cardace 2.5", "generic": "Ramipril 2.5mg", "dosage": "1 tablet daily", "timing": "Morning — may cause initial dry cough"},
        ]
    },
    {
        "condition": "Palpitations / Irregular Heartbeat",
        "symptoms": ["palpitations", "heart racing", "fast heartbeat", "irregular heartbeat", "heart pounding", "heart flutter", "chest pounding", "tachycardia"],
        "description": "Feelings of a fast, fluttering, or pounding heartbeat. Often benign but can indicate cardiac arrhythmia.",
        "diet": "Reduce caffeine and stimulants. Stay hydrated. Magnesium and potassium are important for heart rhythm.",
        "workout": "Seek medical evaluation before continuing exercise. Avoid excessive caffeine and stress.",
        "medicines": [
            {"brand": "Atenolol 25mg", "generic": "Atenolol 25mg Beta-Blocker", "dosage": "25–50mg daily", "timing": "Morning — must consult cardiologist first"},
            {"brand": "Magnesium Supplement", "generic": "Magnesium Citrate 400mg", "dosage": "1 tablet daily", "timing": "With evening meal"},
        ]
    },
    # ── Diabetes ─────────────────────────────────────────────────────────────
    {
        "condition": "Diabetes / High Blood Sugar",
        "symptoms": ["diabetes", "high blood sugar", "sugar high", "frequent urination", "excessive thirst", "increased hunger", "blurred vision diabetes", "fatigue diabetes", "sugar patient"],
        "description": "A metabolic disease where blood sugar levels are persistently high due to insufficient insulin or insulin resistance.",
        "diet": "Low glycemic index diet. Avoid sugary foods and refined carbs. Increase fiber intake. Eat meals at regular times.",
        "workout": "150 minutes of moderate aerobic activity per week. Check blood sugar before and after exercise. Carry a fast sugar source.",
        "medicines": [
            {"brand": "Glycomet 500", "generic": "Metformin 500mg", "dosage": "1 tablet twice daily", "timing": "With or after meals (reduce GI side effects)"},
            {"brand": "Galvus Met", "generic": "Vildagliptin 50mg + Metformin 500mg", "dosage": "1 tablet twice daily", "timing": "With meals — consult diabetologist"},
        ]
    },
    # ── Skin Conditions ───────────────────────────────────────────────────────
    {
        "condition": "Acne / Pimples",
        "symptoms": ["acne", "pimples", "blackheads", "whiteheads", "spots", "breakout", "skin breakout", "face pimples"],
        "description": "A skin condition when hair follicles become clogged with oil and dead skin cells, causing pimples and blackheads.",
        "diet": "Low-glycemic, low-dairy diet. Foods rich in zinc (pumpkin seeds), Omega-3, and antioxidants support clear skin.",
        "workout": "Exercise reduces stress hormones that trigger acne. Cleanse face immediately after sweating.",
        "medicines": [
            {"brand": "Clindac A Gel", "generic": "Clindamycin 1% + Nicotinamide 4% Gel", "dosage": "Apply thin layer", "timing": "Once at night on cleansed face"},
            {"brand": "Adapalene (Epiduo)", "generic": "Adapalene 0.1% Gel", "dosage": "Apply pea-sized amount", "timing": "Once at night (start 2–3 nights/week to build tolerance)"},
        ]
    },
    {
        "condition": "Fungal Infection",
        "symptoms": ["fungal infection", "ringworm", "athlete foot", "jock itch", "tinea", "fungus", "itchy groin", "itchy feet", "skin fungus"],
        "description": "Common skin infections caused by fungi, presenting as red, itchy, scaly patches in warm, moist areas.",
        "diet": "Reduce sugar intake which feeds fungal growth. Probiotics from yogurt help restore balance.",
        "workout": "Keep skin dry. Change workout clothes and socks immediately after exercise. Use antifungal powder in shoes.",
        "medicines": [
            {"brand": "Canesten Cream", "generic": "Clotrimazole 1% Cream", "dosage": "Apply thin layer", "timing": "Twice daily for 2–4 weeks"},
            {"brand": "Terbicip Cream", "generic": "Terbinafine 1% Cream", "dosage": "Apply once or twice daily", "timing": "For 1–4 weeks until infection clears"},
        ]
    },
    # ── Urinary ──────────────────────────────────────────────────────────────
    {
        "condition": "Urinary Tract Infection (UTI)",
        "symptoms": ["uti", "urinary infection", "burning urination", "frequent urination", "painful urination", "bladder infection", "pee burning", "urinary tract infection", "dysuria"],
        "description": "Bacterial infection in the urinary tract causing painful, frequent, and urgent urination and sometimes fever.",
        "diet": "Drink plenty of water (8–10 glasses/day). Unsweetened cranberry juice may help. Avoid caffeine, alcohol, and spicy foods.",
        "workout": "Rest during acute phase. Urinate before and after exercise. Stay extremely well-hydrated.",
        "medicines": [
            {"brand": "Norflox-TZ", "generic": "Norfloxacin 400mg + Tinidazole 600mg", "dosage": "1 tablet twice daily for 5 days", "timing": "After meals (complete the full course)"},
            {"brand": "Ural Sachet", "generic": "Potassium Citrate + Citric Acid", "dosage": "1 sachet dissolved in water 3 times daily", "timing": "With meals to reduce acidity of urine"},
        ]
    },
    # ── Eyes / Ears ───────────────────────────────────────────────────────────
    {
        "condition": "Earache / Otitis",
        "symptoms": ["earache", "ear pain", "ear infection", "ear ache", "pain in ear", "blocked ear", "ear discharge", "hearing loss ear", "otitis"],
        "description": "Ear pain caused by infection, inflammation, or fluid buildup in the middle or outer ear.",
        "diet": "Anti-inflammatory diet. Stay hydrated. Warm compress on ear for pain relief.",
        "workout": "Avoid swimming until infection resolves. Keep ears dry.",
        "medicines": [
            {"brand": "Otosporin Ear Drops", "generic": "Polymyxin B + Neomycin + Hydrocortisone Ear Drops", "dosage": "3–4 drops in affected ear", "timing": "3–4 times daily for 7–10 days"},
            {"brand": "Combiflam Tablet", "generic": "Ibuprofen 400mg + Paracetamol 325mg", "dosage": "1 tablet every 8 hours", "timing": "After meals for pain relief"},
        ]
    },
    # ── Women's Health ────────────────────────────────────────────────────────
    {
        "condition": "Menstrual Pain / Dysmenorrhea",
        "symptoms": ["period pain", "menstrual cramps", "dysmenorrhea", "menstrual pain", "period cramps", "painful periods", "stomach pain period"],
        "description": "Cramping pain in the lower abdomen before and during menstruation caused by uterine contractions.",
        "diet": "Magnesium-rich foods (dark chocolate, leafy greens) reduce cramps. Reduce salt and caffeine. Increase Omega-3.",
        "workout": "Light yoga, walking, and stretching reduce period pain. Heating pad on the lower abdomen provides significant relief.",
        "medicines": [
            {"brand": "Meftal Spas", "generic": "Mefenamic Acid 250mg + Dicyclomine 10mg", "dosage": "1 tablet 3 times daily", "timing": "Start 1 day before expected period — take after meals"},
            {"brand": "Ibuprofen (Brufen)", "generic": "Ibuprofen 400mg", "dosage": "1 tablet every 8 hours", "timing": "With meals — start at first sign of cramps"},
        ]
    },
    # ── Infectious ─────────────────────────────────────────────────────────────
    {
        "condition": "Typhoid Fever",
        "symptoms": ["typhoid", "sustained fever", "step ladder fever", "rose spots", "spleen enlargement", "typhoid fever", "week-long fever"],
        "description": "Bacterial (Salmonella) infection causing prolonged high fever, abdominal pain, and general weakness.",
        "diet": "High-calorie soft and liquid diet: porridge, soups, fruit juices. Avoid raw vegetables and spicy foods.",
        "workout": "Complete bed rest during fever. Gradual return to activity after full recovery (2–3 weeks).",
        "medicines": [
            {"brand": "Azithral 500", "generic": "Azithromycin 500mg", "dosage": "1 tablet daily for 7 days", "timing": "On an empty stomach — first-line treatment for uncomplicated typhoid"},
            {"brand": "Cefspan", "generic": "Cefixime 200mg", "dosage": "1 capsule twice daily for 14 days", "timing": "After meals"},
        ]
    },
    {
        "condition": "Malaria",
        "symptoms": ["malaria", "intermittent fever", "fever with sweating", "fever with chills alternating", "malaria fever", "plasmodium infection"],
        "description": "Parasitic infection transmitted by Anopheles mosquitoes causing cyclical fever, chills, and sweating.",
        "diet": "Easy-to-digest foods and adequate fluids. Freshly squeezed citrus juices and soft foods during fever.",
        "workout": "Complete bed rest during active infection. Gradually resume after full recovery.",
        "medicines": [
            {"brand": "Lariago", "generic": "Chloroquine 250mg", "dosage": "As prescribed course", "timing": "Consult doctor — treatment varies by malaria species"},
            {"brand": "Malanil", "generic": "Atovaquone 250mg + Proguanil 100mg", "dosage": "4 tablets once daily for 3 days", "timing": "Same time each day with food or milk"},
        ]
    },
    {
        "condition": "Dengue Fever",
        "symptoms": ["dengue", "dengue fever", "bone crushing fever", "severe headache with fever", "muscle pain with fever", "low platelet", "dengue symptoms"],
        "description": "Viral fever transmitted by Aedes mosquitoes causing high fever, severe headache, body aches, and low platelet count.",
        "diet": "Papaya leaf juice may help increase platelets. High fluid intake: ORS, coconut water, fresh fruit juices. Avoid NSAIDs.",
        "workout": "Complete bed rest. No physical activity during illness.",
        "medicines": [
            {"brand": "Crocin 650", "generic": "Paracetamol 650mg", "dosage": "1 tablet every 6 hours", "timing": "For fever management — AVOID NSAIDs like ibuprofen/aspirin"},
            {"brand": "ORS (Electral)", "generic": "Oral Rehydration Salts", "dosage": "1 packet per litre of water", "timing": "Sip throughout the day to prevent dehydration"},
        ]
    },
    # ── Thyroid ───────────────────────────────────────────────────────────────
    {
        "condition": "Hypothyroidism",
        "symptoms": ["hypothyroidism", "low thyroid", "weight gain thyroid", "fatigue thyroid", "cold intolerance", "dry skin thyroid", "constipation thyroid", "slow metabolism"],
        "description": "Underactive thyroid gland producing insufficient thyroid hormone, leading to fatigue, weight gain, and other metabolic issues.",
        "diet": "Iodine-rich foods (seafood, iodized salt). Selenium from Brazil nuts. Avoid excessive raw goitrogens (cabbage, soy).",
        "workout": "Regular low-to-moderate exercise (walking, yoga, swimming) improves metabolism and mood.",
        "medicines": [
            {"brand": "Eltroxin", "generic": "Levothyroxine 50mcg", "dosage": "As prescribed by endocrinologist", "timing": "First thing in morning on empty stomach — wait 30 min before eating"},
            {"brand": "Thyronorm", "generic": "Levothyroxine Sodium 50/75/100mcg", "dosage": "As prescribed", "timing": "Morning on empty stomach — lifetime medication"},
        ]
    },
    # ── Metabolic / Nutritional ───────────────────────────────────────────────
    {
        "condition": "Anemia / Iron Deficiency",
        "symptoms": ["anemia", "anaemia", "low hemoglobin", "low haemoglobin", "weakness anemia", "pale skin", "fatigue anemia", "shortness of breath anemia", "iron deficiency"],
        "description": "Inadequate red blood cells or hemoglobin, most commonly due to iron, B12, or folate deficiency.",
        "diet": "Iron-rich foods: red meat, spinach, lentils, tofu, fortified cereals. Vitamin C aids iron absorption. Avoid coffee/tea with iron-rich meals.",
        "workout": "Gentle exercise is fine. Avoid high-intensity exercise until hemoglobin normalizes.",
        "medicines": [
            {"brand": "Orofer S Syrup", "generic": "Ferric Ammonium Citrate + Folic Acid", "dosage": "10–15ml daily", "timing": "After meals to reduce nausea"},
            {"brand": "Feosol", "generic": "Ferrous Sulfate 325mg", "dosage": "1 tablet daily", "timing": "With food (take with Vitamin C for better absorption)"},
        ]
    },
    {
        "condition": "Vitamin D Deficiency",
        "symptoms": ["vitamin d deficiency", "bone pain", "muscle weakness", "fatigue vitamin d", "frequent infections", "low vitamin d", "rickets", "osteomalacia"],
        "description": "Insufficient Vitamin D levels leading to bone weakness, muscle pain, fatigue, and increased infection susceptibility.",
        "diet": "Fatty fish (salmon, mackerel), egg yolks, fortified milk, and mushrooms. Sunlight exposure (15–20 min/day).",
        "workout": "Outdoor exercise optimizes Vitamin D synthesis. Resistance training improves bone density.",
        "medicines": [
            {"brand": "D-Rise 60K", "generic": "Cholecalciferol 60,000 IU (Vitamin D3)", "dosage": "1 sachet weekly for 8 weeks", "timing": "With a fatty meal for optimal absorption"},
            {"brand": "Calcirol 4L", "generic": "Cholecalciferol 4 Lakh IU", "dosage": "As prescribed", "timing": "Single loading dose orally or IM — consult doctor"},
        ]
    },
    # ── Respiratory (cont.) ────────────────────────────────────────────────────
    {
        "condition": "Sinusitis",
        "symptoms": ["sinusitis", "sinus pain", "facial pain", "sinus pressure", "sinus congestion", "cheek pain", "forehead pain", "sinus headache", "nasal blockage"],
        "description": "Inflammation of the sinuses causing facial pain, pressure, nasal congestion, and headache.",
        "diet": "Spicy foods and steam inhalation open sinus passages. Warm fluids help thin mucus. Honey and ginger tea soothe symptoms.",
        "workout": "Steam inhalation twice daily. Avoid cold environments. Nasal irrigation with saline solution is very effective.",
        "medicines": [
            {"brand": "Otrivin Plus", "generic": "Xylometazoline + Ipratropium Nasal Spray", "dosage": "2 sprays per nostril", "timing": "Twice daily — not more than 5 days (rebound congestion risk)"},
            {"brand": "Augmentin 625", "generic": "Amoxicillin 500mg + Clavulanic Acid 125mg", "dosage": "1 tablet twice daily for 7 days", "timing": "With meals — only if bacterial (consult ENT)"},
        ]
    },
    # ── Kidney ────────────────────────────────────────────────────────────────
    {
        "condition": "Kidney Stones",
        "symptoms": ["kidney stone", "renal colic", "flank pain", "back pain with urination", "blood in urine", "groin pain", "kidney pain", "ureter stone", "nephrolithiasis"],
        "description": "Hard deposits of minerals that form in the kidneys and can cause severe pain as they move through the urinary tract.",
        "diet": "Drink 2.5–3 litres of water daily. Reduce sodium, animal protein, and oxalate-rich foods (beets, nuts, tea). Lemon juice helps.",
        "workout": "Stay hydrated during exercise. Non-strenuous activity is fine. Extreme exercise without hydration increases stone risk.",
        "medicines": [
            {"brand": "Cystone", "generic": "Didymocarpus + Saxifrage (Ayurvedic)", "dosage": "2 tablets twice daily", "timing": "After meals (helps dissolve and pass small stones)"},
            {"brand": "Urimax 0.4", "generic": "Tamsulosin 0.4mg", "dosage": "1 capsule daily", "timing": "After dinner (alpha-blocker helps pass stones through ureter)"},
        ]
    },
    # ── Children's conditions ─────────────────────────────────────────────────
    {
        "condition": "Chickenpox",
        "symptoms": ["chickenpox", "chicken pox", "varicella", "itchy blisters", "red blisters", "water blisters with fever"],
        "description": "Highly contagious viral infection causing an itchy blister rash, fever, and tiredness.",
        "diet": "Soft, non-acidic foods (avoid citrus). Popsicles for mouth sores. Adequate fluids. No aspirin in children.",
        "workout": "Isolation and rest until all blisters have crusted over (typically 5–7 days after rash appears).",
        "medicines": [
            {"brand": "Calamine Lotion", "generic": "Calamine + Zinc Oxide Lotion", "dosage": "Apply to itchy areas", "timing": "3–4 times daily to relieve itching"},
            {"brand": "Acivir 400", "generic": "Acyclovir 400mg", "dosage": "800mg 5 times daily for 7 days", "timing": "Start within 24–48 hours of rash for best effect — especially in adults"},
        ]
    },
    # ── Dental ────────────────────────────────────────────────────────────────
    {
        "condition": "Toothache / Dental Pain",
        "symptoms": ["toothache", "tooth pain", "dental pain", "tooth ache", "gum pain", "swollen gum", "tooth sensitivity", "painful tooth"],
        "description": "Pain in or around a tooth caused by cavities, infection, gum disease, or broken tooth.",
        "diet": "Soft foods. Avoid extremely hot, cold, or sweet foods. Clove oil provides natural temporary pain relief.",
        "workout": "Avoid heavy straining. See a dentist — this is not a condition to manage solely with medication.",
        "medicines": [
            {"brand": "Ibuprofen Tablet", "generic": "Ibuprofen 400mg", "dosage": "1 tablet every 8 hours", "timing": "After meals for pain relief (temporary — must see dentist)"},
            {"brand": "Clove Oil", "generic": "Eugenol (Clove Oil)", "dosage": "Apply 1–2 drops on cotton", "timing": "Apply to tooth for 20 minutes, 3–4 times daily"},
        ]
    },
]

# Clear old records and insert fresh ones
result = db["recommendations"].delete_many({})
print(f"Cleared {result.deleted_count} old recommendations")

inserted = db["recommendations"].insert_many(RECOMMENDATIONS)
print(f"Inserted {len(inserted.inserted_ids)} recommendations")
print("\nConditions loaded:")
for r in RECOMMENDATIONS:
    print(f"  - {r['condition']} ({len(r['symptoms'])} symptom keywords)")

client.close()
print("\nDone! Database seeded successfully.")
