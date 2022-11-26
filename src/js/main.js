const appendFoods = document.querySelectorAll('.calendar__append')
const calendarPage = document.querySelector('.calendar')
const productPage = document.querySelector('.add-manager')
const categoryBtns = document.querySelectorAll('.add-manager__category-btn')
const carbohydratesSum = document.querySelector('.carbohydrates-sum')
const proteinSum = document.querySelector('.protein-sum')
const fatSum = document.querySelector('.fat-sum')
const caloriesSum = document.querySelector('.calories-sum')
const ingredientModal = document.querySelector('.add-manager__ingredient-modal')
const ingredientAddBtn = document.querySelector('.add-manager__ingredient-add-btn')
const createProductBtn = document.querySelector('.add-manager__create-product-btn')
const modalBtnX = document.querySelector('.btn-x')
const modalBtnPlus = document.querySelector('.btn-plus')
const listContainer = document.querySelector('.add-manager__list-container')
const listAddBtn = document.querySelector('.add-manager__list-btn--add')
const productContainer = document.querySelector('.add-manager__product-container')
const productHeader = document.querySelector('.add-manager__label--manage-header')
const productName = document.querySelector('.product-name')
const calendarNavBtn = document.querySelector('.nav-bar__btn--calendar')
const productNavBtn = document.querySelector('.nav-bar__btn--product')

const ingredientBox = document.querySelector('.add-manager__ingredient-box')

const ingredientName = document.querySelector('.ingredient-input')
const carbohydrates = document.querySelector('.carbohydrate-input')
const proteins = document.querySelector('.protein-input')
const fats = document.querySelector('.fat-input')
const weights = document.querySelector('.weight-input')

let targetBox
let activeCategory
let products = []
let ingredients = []

class Product {
	constructor(name, category, ingredients) {
		this.name = name
		this.id = Product.nextId
		this.category = category
		this.ingredients = ingredients
		this.calories = CalculateCalories.GetCalories(ingredients)
		Product.nextId++
	}
	static nextId = 0
}

class Ingredient {
	constructor(name, carb, prot, fat, weight) {
		this.name = name
		this.carbohydrates = carb
		this.proteins = prot
		this.fat = fat
		this.weight = weight
	}
}

class CalculateCalories {
	static GetCalories(ingredients) {
		let CalSum = 0
		if (Array.isArray(ingredients)) {
			ingredients.forEach(ing => {
				CalSum += ((4 * ing.carbohydrates + 4 * ing.proteins + 9 * ing.fat) * ing.weight) / 100
			})
		} else {
			CalSum +=
				((4 * ingredients.carbohydrates + 4 * ingredients.proteins + 9 * ingredients.fat) * ingredients.weight) / 100
		}
		return CalSum
	}
}

const loadElements = () => {
	activeCategory = document.querySelector('.add-manager__category-btn--active')
}

const showAddFood = e => {
	const appendFoodBtn = e.target
	targetBox = appendFoodBtn.closest('.calendar__food-box')
	const cat = targetBox.querySelector('.calendar__food-category')
	const foodList = document.createElement('div')
	foodList.classList.add('calendar__food-list')
	targetBox.append(foodList)
	products.forEach(product => {
		const btn = document.createElement('button')
		btn.classList.add('calendar__add-product')
		btn.textContent = product.name
		btn.addEventListener('click', addFood)
		foodList.append(btn)
	})
	appendFoodBtn.removeEventListener('click', showAddFood)
	appendFoodBtn.addEventListener('click', closeAppend)
	appendFoodBtn.textContent = 'Zamknij'
}

function hideAddFood(target) {
	target.removeEventListener('click', closeAppend)
	target.addEventListener('click', showAddFood)
	target.textContent = 'Dodaj produkt'
}

const addFood = e => {
	const box = e.target.closest('.calendar__food-box')
	const appendElement = box.querySelector('.calendar__append')
	const foods = box.querySelector('.calendar__foods')
	const foodList = box.querySelector('.calendar__food-list')
	const foodItem = document.createElement('div')
	foodItem.classList.add('calendar__food-item')
	const foodName = document.createElement('p')
	foodName.classList.add('calendar__food-name')
	foodName.textContent = e.target.textContent
	const removebtn = document.createElement('button')
	removebtn.classList.add('calendar__food-remove')
	removebtn.textContent = 'x'
	removebtn.addEventListener('click', removeFood)
	foods.append(foodItem)
	foodItem.append(foodName, removebtn)
	hideAddFood(appendElement)
	foodList.remove()
}

const removeFood = e => {
	e.target.parentElement.remove()
}

const closeAppend = e => {
	const box = e.target.closest('.calendar__food-box')
	const foodList = box.querySelector('.calendar__food-list')
	foodList.remove()
	hideAddFood(e.target)
}

const toggleBtn = e => {
	if (activeCategory != null) {
		activeCategory.classList.remove('add-manager__category-btn--active')
	}
	e.target.classList.toggle('add-manager__category-btn--active')
	activeCategory = e.target
}

const toggleModal = () => {
	ingredientModal.classList.toggle('disabled')
}

const setCalendarPage = () => {
	if (calendarPage.classList.contains('disabled')) {
		calendarPage.classList.remove('disabled')
		productPage.classList.add('disabled')
	}
}

const setProductPage = () => {
	if (productPage.classList.contains('disabled')) {
		calendarPage.classList.add('disabled')
		productPage.classList.remove('disabled')
	}
}

const addIngredient = () => {
	const name = ingredientName.value
	const carb = Number(carbohydrates.value)
	const prot = Number(proteins.value)
	const fat = Number(fats.value)
	const weigh = Number(weights.value)
	const ingredient = new Ingredient(name, carb, prot, fat, weigh)
	ingredients.push(ingredient)
	ingredientModal.classList.toggle('disabled')
	createIngredient(ingredient)
}

function createIngredient(ingredient) {
	const name = ingredient.name
	const carbo = ingredient.carbohydrates
	const prote = ingredient.proteins
	const fat = ingredient.fat
	const weight = ingredient.weight
	const ingredientDetails = createIngredientDetails(name, weight)
	const macroBox = createMacroBox(carbo, prote, fat, weight)
	const manageBox = createManageBox()
	ingredientBox.appendChild(ingredientDetails)
	ingredientDetails.append(macroBox, manageBox)
	ingredientBox.insertBefore(ingredientDetails, ingredientAddBtn)
}

function createIngredientDetails(name, weight) {
	const ingredientDetails = document.createElement('div')
	ingredientDetails.classList.add('add-manager__ingredient-details')
	const ingredientName = document.createElement('p')
	ingredientName.classList.add('add-manager__label', 'add-manager__label--ingredient')
	const ingredientWeight = document.createElement('p')
	ingredientWeight.classList.add('add-manager__label', 'add-manager__label--calories')
	ingredientDetails.append(ingredientName, ingredientWeight)
	ingredientName.textContent = name
	ingredientWeight.textContent = weight

	return ingredientDetails
}
function createMacroBox(carbo, prote, fat, weight) {
	const macroBox = document.createElement('div')
	macroBox.classList.add('add-manager__ingredient-macro-box')
	const carboSpan = document.createElement('span')
	carboSpan.classList.add('add-manager__ingredient-macro-item', 'carbohydrates')
	const proteSpan = document.createElement('span')
	proteSpan.classList.add('add-manager__ingredient-macro-item', 'protein')
	const fatSpan = document.createElement('span')
	fatSpan.classList.add('add-manager__ingredient-macro-item', 'fat')
	const carboValue = (carbo * weight) / 100
	const proteValue = (prote * weight) / 100
	const fatValue = (fat * weight) / 100
	carboSpan.textContent = 'W:' + carboValue
	proteSpan.textContent = 'B:' + proteValue
	fatSpan.textContent = 'T:' + fatValue
	const carboS = Number(carbohydratesSum.textContent) + carboValue
	const proteS = Number(proteinSum.textContent) + proteValue
	const fatS = Number(fatSum.textContent) + fatValue
	carbohydratesSum.textContent = carboS
	proteinSum.textContent = proteS
	fatSum.textContent = fatS
	caloriesSum.textContent = carboS * 4 + proteS * 4 + fatS * 9

	macroBox.append(carboSpan, proteSpan, fatSpan)

	return macroBox
}
function createManageBox() {
	const manageBox = document.createElement('div')
	manageBox.classList.add('add-manager__ingredient-manage-box')
	const editBtn = document.createElement('button')
	editBtn.classList.add('add-manager__ingredient-manage-item')
	const cancelBtn = document.createElement('button')
	cancelBtn.classList.add('add-manager__ingredient-manage-item')
	const editIcon = document.createElement('i')
	const cancelIcon = document.createElement('i')
	editIcon.classList.add('fa-solid', 'fa-pen-to-square')
	cancelIcon.classList.add('fa-solid', 'fa-xmark')
	manageBox.append(editBtn, cancelBtn)
	editBtn.append(editIcon)
	cancelBtn.append(cancelIcon)
	cancelBtn.addEventListener('click', removeIngredient)

	return manageBox
}

const removeIngredient = e => {
	const ingredientItem = e.target.closest('.add-manager__ingredient-details')
	ingredientItem.remove()
	//zaktualizować makro i kalorie, zaktualizowac liste skladnikow produktu
}

function addProductToList(product) {
	const name = product.name
	const id = product.id
	const category = product.category
	createListItem(name, category, id)
}

function createListItem(name, category, id) {
	const listItem = document.createElement('div')
	const nameDiv = document.createElement('p')
	const editBtn = document.createElement('button')

	listContainer.append(listItem)
	listItem.append(nameDiv, editBtn)

	listItem.classList.add('add-manager__list-item')
	listItem.dataset.id = id
	listItem.dataset.type = category
	nameDiv.classList.add('add-manager__label--name')
	editBtn.classList.add('add-manager__list-btn', 'add-manager__list-btn--edit')
	editBtn.dataset.id = id
	editBtn.dataset.type = category

	nameDiv.textContent = name
	editBtn.textContent = 'edit'
	editBtn.addEventListener('click', setEditMode)
	activeCategory.classList.remove('add-manager__category-btn--active')
	activeCategory = productContainer.querySelector(`[data-type="breakfast"]`)
	activeCategory.classList.add('add-manager__category-btn--active')
}

const createProduct = () => {
	const name = productName.value
	const category = activeCategory.dataset.type
	const product = new Product(name, category, ingredients)
	productContainer.dataset.id = product.id
	products.push(product)
	addProductToList(product)
	resetProduct()
}

function updateProduct(id) {
	const product = getProductById(id)
	const category = activeCategory.dataset.type
	product.name = productName.value
	product.ingredients = ingredients
	product.category = category
	product.calories = CalculateCalories.GetCalories(ingredients)
	const item = getListItemById(id)
	item.dataset.type = category
	const editBtn = item.querySelector('.add-manager__list-btn--edit')
	editBtn.dataset.type = category
	const label = item.querySelector('.add-manager__label--name')
	label.textContent = product.name
}

const editProduct = e => {
	const target = e.target.closest('.add-manager__product-container')
	const id = Number(target.dataset.id)
	updateProduct(id)
}

const setEditMode = e => {
	productHeader.textContent = 'Edytuj przepis'
	const id = Number(e.target.dataset.id)
	const category = e.target.dataset.type
	activeCategory.classList.remove('add-manager__category-btn--active')
	activeCategory = productContainer.querySelector(`[data-type=${category}]`)
	activeCategory.classList.add('add-manager__category-btn--active')
	createProductBtn.textContent = 'Edytuj produkt'
	loadProduct(id)
}

const setAddMode = () => {
	productHeader.textContent = 'Dodaj nowy przepis'
	createProductBtn.textContent = 'Dodaj nowy produkt'
	resetProduct()
}

function getProductById(id) {
	return products.filter(product => product.id === id)[0]
}

function getListItemById(id) {
	const listItems = Array.from(document.querySelectorAll('.add-manager__list-item'))
	const listItem = listItems.filter(item => item.dataset.id == id)[0]
	return listItem
}

function loadProduct(id) {
	const prod = getProductById(id)
	const ingreds = document.querySelectorAll('.add-manager__ingredient-details')
	ingreds.forEach(ingr => ingr.remove())
	productName.value = prod.name
	ingredients = prod.ingredients
	productContainer.dataset.id = id
	let carbs = 0
	let prots = 0
	let fats = 0
	ingredients.forEach(ingredient => {
		carbs += (Number(ingredient.carbohydrates) * Number(ingredient.weight)) / 100
		prots += (Number(ingredient.proteins) * ingredient.weight) / 100
		fats += (ingredient.fat * Number(ingredient.weight)) / 100
		createIngredient(ingredient)
	})
	carbohydratesSum.textContent = carbs
	proteinSum.textContent = prots
	fatSum.textContent = fats
	caloriesSum.textContent = prod.calories
	createProductBtn.removeEventListener('click', createProduct)
	createProductBtn.addEventListener('click', editProduct)
}

function resetProduct() {
	productName.value = ''
	productContainer.dataset.id = '-1'
	ingredients = []
	carbohydratesSum.textContent = ''
	proteinSum.textContent = ''
	fatSum.textContent = ''
	caloriesSum.textContent = ''
	const inputs = document.querySelectorAll('.input-field')
	const ingreds = document.querySelectorAll('.add-manager__ingredient-details')
	inputs.forEach(input => (input.value = ''))
	ingreds.forEach(ingr => ingr.remove())
	activeCategory.classList.remove('add-manager__category-btn--active')
	activeCategory = productContainer.querySelector(`[data-type="breakfast"]`)
	activeCategory.classList.add('add-manager__category-btn--active')
	createProductBtn.removeEventListener('click', editProduct)
	createProductBtn.addEventListener('click', createProduct)
}

document.addEventListener('DOMContentLoaded', loadElements)
appendFoods.forEach(btn => btn.addEventListener('click', showAddFood))
categoryBtns.forEach(btn => btn.addEventListener('click', toggleBtn))
calendarNavBtn.addEventListener('click', setCalendarPage)
productNavBtn.addEventListener('click', setProductPage)
ingredientAddBtn.addEventListener('click', toggleModal)
modalBtnX.addEventListener('click', toggleModal)
modalBtnPlus.addEventListener('click', addIngredient)
createProductBtn.addEventListener('click', createProduct)
listAddBtn.addEventListener('click', setAddMode)
