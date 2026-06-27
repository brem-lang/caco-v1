import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const CATEGORIES = [
  { name: "Hot Coffee", sort_order: 1 },
  { name: "Iced Coffee", sort_order: 2 },
  { name: "Matcha", sort_order: 3 },
  { name: "Non Coffee", sort_order: 4 },
  { name: "Coffee & Tea Additionals", sort_order: 5 },
  { name: "Soda & Yakult", sort_order: 6 },
  { name: "Signature Sodas", sort_order: 7 },
  { name: "Soda w/ Nata", sort_order: 8 },
  { name: "Soda & Drinks Additionals", sort_order: 9 },
  { name: "Rice Bowl", sort_order: 10 },
  { name: "Rice Bowl Add-ons", sort_order: 11 },
  { name: "Pancakes", sort_order: 12 },
  { name: "Snacks & Bites", sort_order: 13 },
]

const PRODUCTS: { category: string; name: string; base_price: number }[] = [
  // Hot Coffee
  { category: "Hot Coffee", name: "Americano", base_price: 90 },
  { category: "Hot Coffee", name: "Cafe Latte", base_price: 100 },
  { category: "Hot Coffee", name: "Cappuccino", base_price: 100 },
  { category: "Hot Coffee", name: "Spanish Latte", base_price: 125 },
  { category: "Hot Coffee", name: "Caramel Macchiato", base_price: 125 },
  { category: "Hot Coffee", name: "Sea Salt Latte", base_price: 125 },
  { category: "Hot Coffee", name: "Caramel Latte", base_price: 125 },
  { category: "Hot Coffee", name: "Hazelnut Latte", base_price: 125 },
  { category: "Hot Coffee", name: "Vanilla Latte", base_price: 125 },
  // Iced Coffee
  { category: "Iced Coffee", name: "Iced Americano", base_price: 110 },
  { category: "Iced Coffee", name: "Cafe Latte", base_price: 120 },
  { category: "Iced Coffee", name: "Caramel Latte", base_price: 140 },
  { category: "Iced Coffee", name: "Hazelnut Latte", base_price: 130 },
  { category: "Iced Coffee", name: "Vanilla Latte", base_price: 130 },
  { category: "Iced Coffee", name: "Spanish Latte", base_price: 140 },
  { category: "Iced Coffee", name: "Caramel Macchiato", base_price: 150 },
  { category: "Iced Coffee", name: "Sea Salt Latte", base_price: 150 },
  { category: "Iced Coffee", name: "Strawberry Cheesecake", base_price: 140 },
  { category: "Iced Coffee", name: "Vietnamese Sweet", base_price: 150 },
  { category: "Iced Coffee", name: "Caramel Vanilla", base_price: 140 },
  { category: "Iced Coffee", name: "Hazelnut Caramel", base_price: 140 },
  { category: "Iced Coffee", name: "Cheesecake Latte", base_price: 150 },
  { category: "Iced Coffee", name: "Dirty Strawberry", base_price: 130 },
  { category: "Iced Coffee", name: "Mocha Style Latte", base_price: 140 },
  { category: "Iced Coffee", name: "Biscoff Latte", base_price: 160 },
  // Matcha
  { category: "Matcha", name: "Classic Matcha Latte", base_price: 140 },
  { category: "Matcha", name: "Strawberry Matcha Latte", base_price: 145 },
  { category: "Matcha", name: "Cheesecake Matcha Latte", base_price: 155 },
  { category: "Matcha", name: "Caramel Matcha Latte", base_price: 150 },
  { category: "Matcha", name: "Dirty Matcha", base_price: 155 },
  // Non Coffee
  { category: "Non Coffee", name: "Biscoff Cheesecake", base_price: 160 },
  { category: "Non Coffee", name: "Strawberry Cheesecake", base_price: 155 },
  { category: "Non Coffee", name: "Cookies & Cream Vanilla", base_price: 150 },
  { category: "Non Coffee", name: "Biscoff C&C Twist", base_price: 170 },
  // Coffee & Tea Additionals
  { category: "Coffee & Tea Additionals", name: "Extra Shot of Espresso", base_price: 30 },
  { category: "Coffee & Tea Additionals", name: "Sweetener", base_price: 10 },
  // Soda & Yakult
  { category: "Soda & Yakult", name: "Strawberry w/ Nata", base_price: 90 },
  { category: "Soda & Yakult", name: "Green Apple w/ Nata", base_price: 90 },
  { category: "Soda & Yakult", name: "Four Seasons w/ Nata", base_price: 95 },
  { category: "Soda & Yakult", name: "Green Apple Lychee w/ Nata", base_price: 95 },
  { category: "Soda & Yakult", name: "Tropical Berry w/ Nata", base_price: 95 },
  // Signature Sodas
  { category: "Signature Sodas", name: "Blueberry Lemon", base_price: 75 },
  { category: "Signature Sodas", name: "Lychee Lemon", base_price: 75 },
  { category: "Signature Sodas", name: "Green Apple Blueberry", base_price: 85 },
  { category: "Signature Sodas", name: "Strawberry Lemon", base_price: 75 },
  { category: "Signature Sodas", name: "Four Seasons Lemon", base_price: 75 },
  // Soda w/ Nata
  { category: "Soda w/ Nata", name: "Strawberry Blueberry w/ Nata", base_price: 90 },
  { category: "Soda w/ Nata", name: "Blue Lychee Lemon w/ Nata", base_price: 90 },
  { category: "Soda w/ Nata", name: "Rainbow Fruit Soda Deluxe w/ Nata", base_price: 100 },
  { category: "Soda w/ Nata", name: "Lychee Blueberry w/ Nata", base_price: 90 },
  { category: "Soda w/ Nata", name: "Triple Berry w/ Nata", base_price: 95 },
  // Soda & Drinks Additionals
  { category: "Soda & Drinks Additionals", name: "Nata", base_price: 20 },
  { category: "Soda & Drinks Additionals", name: "Popping Boba", base_price: 25 },
  { category: "Soda & Drinks Additionals", name: "Yakult", base_price: 15 },
  // Rice Bowl
  { category: "Rice Bowl", name: "Honey Garlic Chicken", base_price: 130 },
  { category: "Rice Bowl", name: "Teriyaki Chicken Bowl", base_price: 130 },
  { category: "Rice Bowl", name: "Creamy Garlic Chicken", base_price: 140 },
  // Rice Bowl Add-ons
  { category: "Rice Bowl Add-ons", name: "Sunny-Side Egg", base_price: 20 },
  // Pancakes
  { category: "Pancakes", name: "The Ultimate Biscoff", base_price: 99 },
  { category: "Pancakes", name: "Cookies & Chocolate Dream", base_price: 90 },
  { category: "Pancakes", name: "Berry Bliss Cookies", base_price: 75 },
  { category: "Pancakes", name: "Salted Caramel Crunch", base_price: 75 },
  { category: "Pancakes", name: "Classic Caramel Glaze", base_price: 65 },
  { category: "Pancakes", name: "Strawberry Glaze", base_price: 65 },
  { category: "Pancakes", name: "Chocolate Glaze", base_price: 65 },
  // Snacks & Bites
  { category: "Snacks & Bites", name: "Crispy BBQ Fries", base_price: 50 },
  { category: "Snacks & Bites", name: "Cheesy Fries", base_price: 50 },
  { category: "Snacks & Bites", name: "Sour Cream Fries", base_price: 50 },
  { category: "Snacks & Bites", name: "Sizzling Sisig", base_price: 110 },
  { category: "Snacks & Bites", name: "Fries w/ Cheesy Bacon Overload", base_price: 150 },
  { category: "Snacks & Bites", name: "Loaded Nachos Overload", base_price: 150 },
  { category: "Snacks & Bites", name: "Chicken Carbonara", base_price: 140 },
]

const seedMenu = async () => {
  console.log("Seeding menu data...\n")

  // --- Categories ---
  console.log("Inserting categories...")

  const { data: existingCats, error: fetchError } = await supabase
    .from("categories")
    .select("id, name")

  if (fetchError) {
    console.error("Failed to fetch existing categories:", fetchError.message)
    process.exit(1)
  }

  const existingNames = new Set((existingCats ?? []).map((c: { name: string }) => c.name))
  const categoryIdMap: Record<string, string> = {}

  // Seed existing into map
  for (const cat of existingCats ?? []) {
    categoryIdMap[cat.name] = cat.id
  }

  const newCategories = CATEGORIES.filter((c) => !existingNames.has(c.name))

  if (newCategories.length > 0) {
    const { data: inserted, error: catError } = await supabase
      .from("categories")
      .insert(newCategories)
      .select("id, name")

    if (catError) {
      console.error("Failed to insert categories:", catError.message)
      process.exit(1)
    }

    for (const cat of inserted ?? []) {
      categoryIdMap[cat.name] = cat.id
      console.log(`  ok    category: ${cat.name}`)
    }
  }

  for (const name of existingNames) {
    console.log(`  skip  category: ${name} (already exists)`)
  }

  // --- Products ---
  console.log("\nInserting products...")

  const { data: existingProds, error: prodFetchError } = await supabase
    .from("products")
    .select("name, category_id")

  if (prodFetchError) {
    console.error("Failed to fetch existing products:", prodFetchError.message)
    process.exit(1)
  }

  const existingProdKeys = new Set(
    (existingProds ?? []).map((p: { name: string; category_id: string }) => `${p.category_id}::${p.name}`)
  )

  const newProducts = PRODUCTS.filter((p) => {
    const catId = categoryIdMap[p.category]
    return catId && !existingProdKeys.has(`${catId}::${p.name}`)
  }).map((p) => ({
    name: p.name,
    base_price: p.base_price,
    category_id: categoryIdMap[p.category],
    is_available: true,
  }))

  const skippedCount = PRODUCTS.length - newProducts.length

  if (newProducts.length > 0) {
    const { data: insertedProds, error: prodError } = await supabase
      .from("products")
      .insert(newProducts)
      .select("name")

    if (prodError) {
      console.error("Failed to insert products:", prodError.message)
      process.exit(1)
    }

    for (const p of insertedProds ?? []) {
      console.log(`  ok    product: ${p.name}`)
    }
  }

  if (skippedCount > 0) {
    console.log(`  skip  ${skippedCount} product(s) already exist`)
  }

  console.log(`\nDone. ${newProducts.length} products inserted, ${skippedCount} skipped.`)
}

seedMenu().catch((err) => {
  console.error(err)
  process.exit(1)
})
