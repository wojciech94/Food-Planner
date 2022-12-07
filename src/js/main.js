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
const showDayResumeBtns = document.querySelectorAll('.calendar__food-show-btn')
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

let activeCategory
let products = []
let ingredients = []
let daysPlan = []

class Product {
	constructor(name, category, ingredients) {
		this.name = name
		this.id = Product.nextId
		this.category = category
		this.ingredients = [...ingredients]
		this.calories = CalculationManager.GetCalories(ingredients)
		Product.nextId++
	}
	static nextId = 0
}

class Ingredient {
	constructor(name, carb, prot, fat, weight) {
		this.name = name
		this.id = Ingredient.nextId
		this.carbohydrates = carb
		this.proteins = prot
		this.fat = fat
		this.weight = weight
		Ingredient.nextId++
	}
	static nextId = 0
}

class CalculationManager {
	static GetCalories(ingredients) {
		let CalSum = 0
		if (ingredients.constructor.name === 'Product') {
			ingredients.ingredients.forEach(ingredient => {
				CalSum += this.GetCalories(ingredient)
			})
		} else if (Array.isArray(ingredients)) {
			ingredients.forEach(ing => {
				CalSum += ((4 * ing.carbohydrates + 4 * ing.proteins + 9 * ing.fat) * ing.weight) / 100
			})
		} else {
			CalSum +=
				((4 * ingredients.carbohydrates + 4 * ingredients.proteins + 9 * ingredients.fat) * ingredients.weight) / 100
		}
		return CalSum
	}

	static GetCarbohydrates(ingredients) {
		let carbos = 0
		if (ingredients.constructor.name === 'Product') {
			ingredients.ingredients.forEach(ingredient => {
				carbos += this.GetCarbohydrates(ingredient)
			})
		} else if (Array.isArray(ingredients)) {
			ingredients.forEach(ing => (carbos += (ing.carbohydrates * ing.weight) / 100))
		} else {
			carbos += (ingredients.carbohydrates * ingredients.weight) / 100
		}
		return carbos
	}

	static GetProteins(ingredients) {
		let proteins = 0
		if (ingredients.constructor.name === 'Product') {
			ingredients.ingredients.forEach(ingredient => {
				proteins += this.GetProteins(ingredient)
			})
		} else if (Array.isArray(ingredients)) {
			ingredients.forEach(ing => (proteins += (ing.proteins * ing.weight) / 100))
		} else {
			proteins += (ingredients.proteins * ingredients.weight) / 100
		}
		return proteins
	}

	static GetFats(ingredients) {
		let fats = 0

		if (ingredients.constructor.name === 'Product') {
			ingredients.ingredients.forEach(ingredient => {
				fats += this.GetFats(ingredient)
			})
		} else if (Array.isArray(ingredients)) {
			ingredients.forEach(ing => (fats += (ing.fat * ing.weight) / 100))
		} else {
			fats += (ingredients.fat * ingredients.weight) / 100
		}
		return fats
	}
}

class PlanOfDay {
	constructor(day) {
		this.day = day
		this.products = []
	}
}

//Init days plan objects
function initCalendar() {
	const monday = new PlanOfDay('monday')
	const tuesday = new PlanOfDay('tuesday')
	const wednesday = new PlanOfDay('wednesday')
	const thurstday = new PlanOfDay('thurstday')
	const friday = new PlanOfDay('friday')
	const saturday = new PlanOfDay('saturday')
	const sunday = new PlanOfDay('sunday')
	daysPlan.push(monday, tuesday, wednesday, thurstday, friday, saturday, sunday)
}

//Save to local storage
function saveToStorage() {
	window.localStorage.setItem('products', JSON.stringify(products))
}

//Load active category
const loadElements = () => {
	activeCategory = document.querySelector('.add-manager__category-btn--active')
	if (window.localStorage.getItem('products') !== null) {
		products = JSON.parse(window.localStorage.getItem('products'))
		let maxId = 0
		for (let i = 0; i < products.length; i++) {
			products[i] = Object.assign(new Product('', '', []), products[i])
			if (products[i].id > maxId) {
				maxId = products[i].id
			}
			addProductToList(products[i])
		}
		Product.nextId = maxId + 1
	}
}

//Show food list btns to add it to calendar
const showAddFood = e => {
	const appendFoodBtn = e.target
	const targetBox = appendFoodBtn.closest('.calendar__food-box')
	const foodList = document.createElement('div')
	foodList.classList.add('calendar__food-list')
	targetBox.append(foodList)
	products.forEach(product => {
		const btn = document.createElement('button')
		btn.classList.add('calendar__add-product')
		btn.dataset.id = product.id
		btn.textContent = product.name
		btn.addEventListener('click', addFood)
		foodList.append(btn)
	})
	appendFoodBtn.removeEventListener('click', showAddFood)
	appendFoodBtn.addEventListener('click', closeAppend)
	appendFoodBtn.textContent = 'Zamknij'
	cleanResumes()
}

//Reset add food to calendar events and textcontent
function hideAddFood(target) {
	target.removeEventListener('click', closeAppend)
	target.addEventListener('click', showAddFood)
	target.textContent = 'Dodaj produkt'
}

//Add product to calendar
const addFood = e => {
	const id = Number(e.target.dataset.id)
	const box = e.target.closest('.calendar__food-box')
	const appendElement = box.querySelector('.calendar__append')
	const foods = box.querySelector('.calendar__foods')
	const foodList = box.querySelector('.calendar__food-list')
	const foodItem = document.createElement('div')
	foodItem.classList.add('calendar__food-item')
	const foodName = document.createElement('p')
	foodName.classList.add('calendar__food-name')
	foodName.textContent = e.target.textContent
	foodName.dataset.id = id
	const removebtn = document.createElement('button')
	removebtn.classList.add('calendar__food-remove')
	removebtn.textContent = 'x'
	removebtn.addEventListener('click', removeFood)
	removebtn.dataset.id = id
	foods.append(foodItem)
	foodItem.append(foodName, removebtn)
	const foodColumn = e.target.closest('.calendar__food-column')
	const product = getProductById(id)
	const day = foodColumn.dataset.day
	const planOfDay = daysPlan.filter(d => d.day === day)[0]
	planOfDay.products.push(product)
	hideAddFood(appendElement)
	foodList.remove()
}

//Remove food from calendar
const removeFood = e => {
	const id = Number(e.target.dataset.id)
	const day = e.target.closest('.calendar__food-column').dataset.day
	const planOfDay = daysPlan.filter(d => d.day === day)[0]
	const k = planOfDay.products.findIndex(prod => prod.id === id)
	planOfDay.products.splice(k, 1)
	e.target.parentElement.remove()
	cleanResumes()
}

//Close append food list
const closeAppend = e => {
	const box = e.target.closest('.calendar__food-box')
	const foodList = box.querySelector('.calendar__food-list')
	foodList.remove()
	hideAddFood(e.target)
}

//Toggle product active category
const toggleBtn = e => {
	if (activeCategory != null) {
		activeCategory.classList.remove('add-manager__category-btn--active')
	}
	e.target.classList.toggle('add-manager__category-btn--active')
	activeCategory = e.target
}

//Toggle ingredient modal
const toggleModal = () => {
	if (ingredientModal.classList.contains('disabled')) {
		resetModal()
	}
	ingredientModal.classList.toggle('disabled')
}

//Reset modal state
function resetModal() {
	modalBtnPlus.removeEventListener('click', updateIngredient)
	modalBtnPlus.addEventListener('click', addIngredient)
	modalBtnPlus.removeAttribute('data-ingredient-id')
}

//Show calendar sub-page
const setCalendarPage = () => {
	if (calendarPage.classList.contains('disabled')) {
		calendarPage.classList.remove('disabled')
		productPage.classList.add('disabled')
	}
}

//Set product sub-page
const setProductPage = () => {
	if (productPage.classList.contains('disabled')) {
		calendarPage.classList.add('disabled')
		productPage.classList.remove('disabled')
		cleanResumes()
	}
}

//Reset ingredient modal values
function clearIngredientModal() {
	ingredientName.value = ''
	carbohydrates.value = ''
	proteins.value = ''
	fats.value = ''
	weights.value = ''
}

//Fill ingredient modal by ingredient details
function fillIngredientModal(ingredient) {
	ingredientName.value = ingredient.name
	carbohydrates.value = ingredient.carbohydrates
	proteins.value = ingredient.proteins
	fats.value = ingredient.fat
	weights.value = ingredient.weight
}

//Add ingredient to product
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
	clearIngredientModal()
}

//Update edited ingredient
const updateIngredient = e => {
	const target = e.target
	const id = target.dataset.ingredientId
	const ingredient = getIngredientById(Number(id))
	const ingredientDetials = ingredientBox.querySelector(`.add-manager__ingredient-details[data-ingredient-id="${id}"]`)
	const label = ingredientDetials.querySelector('.add-manager__label--ingredient')
	const weight = ingredientDetials.querySelector('.add-manager__label--weight')
	const manageBox = ingredientDetials.querySelector('.add-manager__ingredient-macro-box')
	const carbs = manageBox.querySelector('.carbohydrates')
	const prote = manageBox.querySelector('.protein')
	const fat = manageBox.querySelector('.fat')
	ingredient.name = ingredientName.value
	ingredient.carbohydrates = carbohydrates.value
	ingredient.proteins = proteins.value
	ingredient.fat = fats.value
	ingredient.weight = weights.value
	label.textContent = ingredientName.value
	weight.textContent = weights.value
	carbs.textContent = 'W:' + carbohydrates.value
	prote.textContent = 'B:' + proteins.value
	fat.textContent = 'T:' + fats.value
	caloriesSum.textContent = CalculationManager.GetCalories(ingredients)
	carbohydratesSum.textContent = CalculationManager.GetCarbohydrates(ingredients)
	proteinSum.textContent = CalculationManager.GetProteins(ingredients)
	fatSum.textContent = CalculationManager.GetFats(ingredients)
	target.removeAttribute('data-ingredient-id')
	modalBtnPlus.removeEventListener('click', updateIngredient)
	modalBtnPlus.addEventListener('click', addIngredient)
	resetModal()
	ingredientModal.classList.add('disabled')
}

//Create ingredient html content
function createIngredient(ingredient) {
	const name = ingredient.name
	const carbo = ingredient.carbohydrates
	const prote = ingredient.proteins
	const fat = ingredient.fat
	const weight = ingredient.weight
	const id = ingredient.id
	const ingredientDetails = createIngredientDetails(name, weight, id)
	const macroBox = createMacroBox(carbo, prote, fat, weight)
	const manageBox = createManageBox()
	ingredientBox.appendChild(ingredientDetails)
	ingredientDetails.append(macroBox, manageBox)
	ingredientBox.insertBefore(ingredientDetails, ingredientAddBtn)
}

//Create ingredient Details content
function createIngredientDetails(name, weight, id) {
	const ingredientDetails = document.createElement('div')
	ingredientDetails.classList.add('add-manager__ingredient-details')
	const ingredientName = document.createElement('p')
	ingredientName.classList.add('add-manager__label', 'add-manager__label--ingredient')
	const ingredientWeight = document.createElement('p')
	ingredientWeight.classList.add('add-manager__label', 'add-manager__label--weight')
	ingredientDetails.append(ingredientName, ingredientWeight)
	ingredientName.textContent = name
	ingredientWeight.textContent = weight
	ingredientDetails.dataset.ingredientId = id

	return ingredientDetails
}

//Create ingredient macro content
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

//Create ingredient manage buttons
function createManageBox() {
	const manageBox = document.createElement('div')
	manageBox.classList.add('add-manager__ingredient-manage-box')
	const editBtn = document.createElement('button')
	editBtn.classList.add('add-manager__ingredient-manage-item')
	editBtn.classList.add('add-manager__ingredient-manage-item--edit')
	const cancelBtn = document.createElement('button')
	cancelBtn.classList.add('add-manager__ingredient-manage-item')
	cancelBtn.classList.add('add-manager__ingredient-manage-item--close')
	const editIcon = document.createElement('i')
	const cancelIcon = document.createElement('i')
	editIcon.classList.add('fa-solid', 'fa-pen-to-square')
	cancelIcon.classList.add('fa-solid', 'fa-xmark')
	manageBox.append(editBtn, cancelBtn)
	editBtn.append(editIcon)
	editBtn.addEventListener('click', editIngredient)
	cancelBtn.append(cancelIcon)
	cancelBtn.addEventListener('click', removeIngredient)

	return manageBox
}

//Execute edit ingredient
const editIngredient = e => {
	const ingredientId = Number(e.target.closest('.add-manager__ingredient-details').dataset.ingredientId)
	const ingredient = ingredients.find(ingr => ingr.id == ingredientId)
	fillIngredientModal(ingredient)
	toggleModal()
	modalBtnPlus.dataset.ingredientId = ingredientId
	modalBtnPlus.removeEventListener('click', addIngredient)
	modalBtnPlus.addEventListener('click', updateIngredient)
}

//Remove ingredient from product, recalculate macro
const removeIngredient = e => {
	const ingredientItem = e.target.closest('.add-manager__ingredient-details')
	const id = ingredientItem.dataset.ingredientId
	ingredientItem.remove()
	ingredients = ingredients.filter(ingr => ingr.id !== Number(id))
	caloriesSum.textContent = CalculationManager.GetCalories(ingredients)
	carbohydratesSum.textContent = CalculationManager.GetCarbohydrates(ingredients)
	proteinSum.textContent = CalculationManager.GetProteins(ingredients)
	fatSum.textContent = CalculationManager.GetFats(ingredients)
}

//Create product list item
function addProductToList(product) {
	const name = product.name
	const id = product.id
	const category = product.category
	createListItem(name, category, id)
}

//Create product list content
function createListItem(name, category, id) {
	const listItem = document.createElement('div')
	const nameDiv = document.createElement('p')
	const editBtn = document.createElement('button')
	const removeBtn = document.createElement('button')
	const manageBox = document.createElement('div')
	const editIcon = document.createElement('i')
	const cancelIcon = document.createElement('i')

	listContainer.append(listItem)
	listItem.append(nameDiv, manageBox)
	manageBox.append(editBtn, removeBtn)

	manageBox.classList.add('add-manager__ingredient-manage-box')
	editIcon.classList.add('fa-solid', 'fa-pen-to-square')
	cancelIcon.classList.add('fa-solid', 'fa-xmark')
	listItem.classList.add('add-manager__list-item')
	listItem.dataset.id = id
	listItem.dataset.type = category
	nameDiv.classList.add('add-manager__label--list')
	editBtn.classList.add('add-manager__list-btn', 'add-manager__list-btn--edit')
	removeBtn.classList.add('add-manager__list-btn', 'add-manager__list-btn--remove')
	editBtn.dataset.id = id
	removeBtn.dataset.id = id
	editBtn.dataset.type = category

	nameDiv.textContent = name
	editBtn.addEventListener('click', setEditMode)
	removeBtn.addEventListener('click', removeProduct)
	editBtn.append(editIcon)
	removeBtn.append(cancelIcon)
	activeCategory.classList.remove('add-manager__category-btn--active')
	activeCategory = productContainer.querySelector(`[data-type="breakfast"]`)
	activeCategory.classList.add('add-manager__category-btn--active')
}

//Create new product and add to list
const createProduct = () => {
	const name = productName.value
	const category = activeCategory.dataset.type
	const product = new Product(name, category, ingredients)
	productContainer.dataset.id = product.id
	products.push(product)
	addProductToList(product)
	resetProduct()
	saveToStorage()
}

//Update product of specified id
function updateProduct(id) {
	const product = getProductById(id)
	const category = activeCategory.dataset.type
	product.name = productName.value
	product.ingredients = [...ingredients] //Copy of array items
	product.category = category
	product.calories = CalculationManager.GetCalories(ingredients)
	const item = getListItemById(id)
	item.dataset.type = category
	const editBtn = item.querySelector('.add-manager__list-btn--edit')
	editBtn.dataset.type = category
	const label = item.querySelector('.add-manager__label--list')
	label.textContent = product.name
}

//Execute edit product btn
const editProduct = e => {
	const target = e.target.closest('.add-manager__product-container')
	const id = Number(target.dataset.id)
	updateProduct(id)
	updateCalendarProducts(id)
	saveToStorage()
}

//Remove product
const removeProduct = e => {
	const parent = e.target.closest('.add-manager__list-item')
	const id = e.target.dataset.id
	parent.remove()
	const listId = products.findIndex(prod => prod.id === Number(id))
	console.log(listId)
	products.splice(listId, 1)
	const calendarItems = calendarPage.querySelectorAll(`.calendar__food-name[data-id="${id}"]`)
	calendarItems.forEach(item => item.parentElement.remove())
	daysPlan.forEach(day => {
		let listId = 0
		do {
			listId = day.products.findIndex(product => product.id === Number(id))
			if (listId >= 0) {
				day.products.splice(listId, 1)
			}
		} while (listId >= 0)
	})
	saveToStorage()
}

//Set edit mode of product page
const setEditMode = e => {
	productHeader.textContent = 'Edytuj przepis'
	const id = Number(e.target.dataset.id)
	const category = e.target.dataset.type
	activeCategory.classList.remove('add-manager__category-btn--active')
	activeCategory = productContainer.querySelector(`[data-type=${category}]`)
	activeCategory.classList.add('add-manager__category-btn--active')
	createProductBtn.textContent = 'Zapisz zmiany'
	createProductBtn.dataset.id = id
	loadProduct(id)
}

//Set add mode of product page
const setAddMode = () => {
	productHeader.textContent = 'Dodaj nowy przepis'
	createProductBtn.textContent = 'Dodaj nowy produkt'
	resetProduct()
}

//Get product from list by id
function getProductById(id) {
	return products.filter(product => product.id === id)[0]
}

//Get list item by product id
function getListItemById(id) {
	const listItems = Array.from(document.querySelectorAll('.add-manager__list-item'))
	const listItem = listItems.filter(item => item.dataset.id == id)[0]
	return listItem
}

function getIngredientById(id) {
	return ingredients.filter(ingr => ingr.id === id)[0]
}

//Load product data in product sub-page (edit mode)
function loadProduct(id) {
	const prod = getProductById(id)
	const ingreds = document.querySelectorAll('.add-manager__ingredient-details')
	ingreds.forEach(ingr => ingr.remove())
	productName.value = prod.name
	ingredients = [...prod.ingredients]
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

//Reset product sub-page
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

//Update product names in calendar panel (after renaming)
function updateCalendarProducts(id) {
	const labels = calendarPage.querySelectorAll(`.calendar__food-name[data-id="${id}"]`)
	console.log(id)
	const productName = getProductById(id).name
	labels.forEach(lab => (lab.textContent = productName))
	updateDaysResume(id)
}

function updateDaysResume(id) {
	const calendarColumns = calendarPage.querySelectorAll('.calendar__food-column')
	calendarColumns.forEach(col => {
		if (col.querySelector(`.calendar__food-name[data-id="${id}"]`)) {
		}
	})
}

//Show resume of day products
const showDayResume = e => {
	const dayName = e.target.closest('.calendar__food-column').dataset.day
	const dayPlan = daysPlan.find(plan => plan.day === dayName)
	const products = dayPlan.products
	const count = products.length
	let cal = 0,
		carb = 0,
		prot = 0,
		fat = 0
	products.forEach(prod => {
		cal += CalculationManager.GetCalories(prod)
		carb += CalculationManager.GetCarbohydrates(prod)
		prot += CalculationManager.GetProteins(prod)
		fat += CalculationManager.GetFats(prod)
	})
	createResumeParagraph(e.target.parentElement, `Produkty:${count}`)
	createResumeParagraph(e.target.parentElement, `Węglowodany:${carb}`)
	createResumeParagraph(e.target.parentElement, `Białko:${prot}`)
	createResumeParagraph(e.target.parentElement, `Tłuszcze:${fat}`)
	createResumeParagraph(e.target.parentElement, `Kalorie:${cal}kcal`)
	e.target.removeEventListener('click', showDayResume)
	e.target.addEventListener('click', closeDayResume)
	e.target.textContent = 'Zamknij podsumowanie'
}

//Create calendar resume macro paragraphs
function createResumeParagraph(parent, text) {
	const paragraph = document.createElement('p')
	paragraph.classList.add('calendar__resume-text')
	paragraph.textContent = text
	parent.append(paragraph)
}

//Close day resume
const closeDayResume = e => {
	e.target.removeEventListener('click', closeDayResume)
	e.target.addEventListener('click', showDayResume)
	const resumeParagraphs = e.target.parentElement.querySelectorAll('.calendar__resume-text')
	resumeParagraphs.forEach(par => par.remove())
	e.target.textContent = 'Pokaż podsumowanie'
}

//Clean Resumes
function cleanResumes() {
	const resumeParagraphs = document.querySelectorAll('.calendar__resume-text')
	resumeParagraphs.forEach(par => par.remove())
	showDayResumeBtns.forEach(btn => {
		btn.textContent = 'Pokaż podsumowanie'
		btn.removeEventListener('click', closeDayResume)
		btn.addEventListener('click', showDayResume)
	})
}

document.addEventListener('DOMContentLoaded', loadElements)
initCalendar()
appendFoods.forEach(btn => btn.addEventListener('click', showAddFood))
categoryBtns.forEach(btn => btn.addEventListener('click', toggleBtn))
showDayResumeBtns.forEach(btn => btn.addEventListener('click', showDayResume))
calendarNavBtn.addEventListener('click', setCalendarPage)
productNavBtn.addEventListener('click', setProductPage)
ingredientAddBtn.addEventListener('click', toggleModal)
modalBtnX.addEventListener('click', toggleModal)
modalBtnPlus.addEventListener('click', addIngredient)
createProductBtn.addEventListener('click', createProduct)
listAddBtn.addEventListener('click', setAddMode)
