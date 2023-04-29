import React, { useState, useRef } from "react";
import RecipeList from "./RecipeList.jsx";
import RecipeListDetails from "./RecipeListDetails.jsx";
import FilterMenu from "./FilterMenu";
import ToggleSwitch from "./ToggleSwitch.jsx"
import '../searchResults.css'
import 'animate.css'

function SearchRecipes() {

  //const APIKEY = '69d5e263b4654e8598c9e50364917a43'

  const APIKEY = '20f0e071a45c4fee9186b2949c47755f'

  const PANTRY = "eggs, bread, chicken, beef, pork, cheese, cheddar, tomatoes, potatoes, mozzerella, yogurt, onions, peppers, carrots, celery, rice, beans"

  var substituteLock = 0;

  let [recipes, setRecipes] = useState([]);
  let [cuisines, setCuisines] = useState("");
  let [mealTypes, setMealTypes] = useState("");
  let [intolerances, setIntolerances] = useState("");
  let [diets, setDiets] = useState("");
  let [strictSearch, setStrictSearch] = useState(false)

  const searchQueryRefFull = useRef();
  const searchQueryRefSmall = useRef();

  async function selectRecipe(id) {
    const newRecipes = [...recipes];
    const recipe = newRecipes.find(recipe => recipe.id === id);

    newRecipes.map(recipe => {
      recipe.isSelected = false;
    })
    recipe.isSelected = true;

    recipe.substitutions = [];
    // NOTE strict search is now actually "Show Ingredient Substitutions"
    if(strictSearch) {
      recipe.missedIngredients.map(async (ingredient) => {
        substituteLock++;
        const headers = { 'Content-Type': 'application/json' };
        let url = "https://api.spoonacular.com/food/ingredients/substitutes?ingredientName=" + ingredient.name + "&apiKey=" + APIKEY;
        await fetch(url, headers)
        .then(response => response.json())
        .then(result => {
          if(result.status == "success") {
            recipe.substitutions.push(result);
          }
          substituteLock--;
        });
      });

    }
    
    // Lock until all requests are finished
    while(substituteLock != 0) {
      await new Promise(r => setTimeout(r, 100));
    }

    setRecipes(newRecipes);
  }

  function unselectRecipe(id) {
    const newRecipes = [...recipes];
    const recipe = newRecipes.find(recipe => recipe.id === id);

    recipe.isSelected = false;
    setRecipes(newRecipes);
  }

  function saveUnsaveRecipe(id) {
    const newRecipes = [...recipes];
    const recipe = newRecipes.find(recipe => recipe.id === id);
    if (recipe.isSaved){
      recipe.isSaved = false;
    }
    else{
      recipe.isSaved = true;
    }
  }

  function strictSearchCallback(checked) {
    setStrictSearch(checked);
  }
  
  function cuisineCallback(filters) {
    setCuisines(filters);
  }

  function mealTypeCallback(filters) {
    setMealTypes(filters);
  }

  function intoleranceCallback(filters) {
    setIntolerances(filters);
  }

  function dietCallback(filters) {
    setDiets(filters);
  }

  function minimizeSearch(){
    document.getElementById("searchForm").className = "animate__animated animate__fadeOutUp";
    showSmallSearch();
  }
  
function showSmallSearch(){
    setTimeout(function(){
      document.getElementById("fullForm").className = "hide";
      document.getElementById("smallForm").className = "smallForm";
      document.getElementById("searchForm").className = "smallSearch animate__animated animate__fadeInDown";
    }, 250);
  }

function changeToGrid(){
  document.getElementById("pageDisplay").className = "gridDisplay";
}

  // Onclick function for search recipes button
  function search (e) {
    e.preventDefault();
    var searchQuery = searchQueryRefFull.current.value;

    if (searchQueryRefSmall.current.value){
      searchQuery = searchQueryRefSmall.current.value;
    }

    
    // GET request using fetch with set headers
    const headers = { 'Content-Type': 'application/json' };
    console.log(searchQuery);
    const url = "https://api.spoonacular.com/recipes/complexSearch?query=" + searchQuery
                + "&includeIngredients=" + PANTRY
                + "&fillIngredients=true&sort=min-missing-ingredients&number=10&ignorePantry=true"
                + "&addRecipeInformation=true"
                + "&cuisine=" + cuisines
                + "&diet=" + diets
                + "&type=" + mealTypes
                + "&intolerances=" + intolerances
                + "&apiKey=" + APIKEY;
    fetch(url, headers)
      .then(response => response.json())
      .then(data => {
        setRecipes(prevRecipes => {
          var recipes = [];
          var substitutions = [];
          for(let i = 0; i < data.number && i < data.totalResults; i++) {
            var result = data.results[i]
            var steps = undefined;
            if(result.analyzedInstructions[0] !== undefined) {
              steps = result.analyzedInstructions[0].steps;
            }
            recipes.push({ count:i, id:result.id, title:result.title, summary:result.summary, image:result.image, steps:steps, ingredients:result.extendedIngredients, missedIngredients:result.missedIngredients, substitutions:substitutions, dishTypes:result.dishTypes, cuisines:result.cuisines, diets:result.diets, isSelected:false, isSaved:false});
            console.log(recipes);
            }
          return recipes
        })
      }).catch( () => {
        console.log("Out of points");
    });
  document.getElementById("pageDisplay").className = "";
}
  
// Onclick function for search recipes button
function getRandomRecipe (e) {
  e.preventDefault();
  // GET request using fetch with set headers
  const headers = { 'Content-Type': 'application/json' };
  const url = "https://api.spoonacular.com/recipes/complexSearch?query="
              + "&includeIngredients=" + PANTRY
              + "&fillIngredients=true&sort=min-missing-ingredients&number=100&ignorePantry=true"
              + "&addRecipeInformation=true"
              + "&cuisine=" + cuisines
              + "&diet=" + diets
              + "&type=" + mealTypes
              + "&intolerances=" + intolerances
              + "&apiKey=" + APIKEY;
  fetch(url, headers)
    .then(response => response.json())
    .then(data => {
      setRecipes(prevRecipes => {
        var recipes = [];
        var substitutions = [];
        var i = Math.floor(Math.random() * 100);
        var result = data.results[i]

        if(result.analyzedInstructions[0] != undefined) {
          var steps = result.analyzedInstructions[0].steps;
        }
        recipes.push({ id:result.id, title:result.title, summary:result.summary, image:result.image,  dishTypes:result.dishTypes, cuisines:result.cuisines, diets:result.diets, steps:steps, ingredients:result.extendedIngredients, missedIngredients:result.missedIngredients, substitutions:substitutions, isSelected:false});
      
        return recipes
      })
    })
  document.getElementById("pageDisplay").className = "";
}
    //maybe onclick, show a different element to get animation.
  return (
    <>
      <div className="search-recipes">
        <div id="container" class="container">
          <div class="mask d-flex align-items-center h-100">
            <div id="container" class="container h-100">
              <div id="form" class="row d-flex justify-content-center align-items-center h-100">
                <div id="searchForm" class="animate__animated animate__fadeInDown animate__fast">
                  <div  class="card" styles="border-radius: 15px;">
                    <div class="card-body p-5">
                      <div id="fullForm">
                        <h1 class="font-weight-bold text-center sig-heading">Search Recipes</h1>
                        <form id="searchBar" class="form-inline justify-content-center my-2 my-lg-0" onSubmit={search}>
                          <input class="form-control mt-sm-4 mr-sm-3" ref={searchQueryRefFull} type="text" placeholder="Search" aria-label="Search"/>
                          <button class="btn btn-outline mt-sm-4 my-2 my-sm-0" onClick={minimizeSearch} type="submit">Search</button>
                          <button class="btn btn-outline mt-sm-4 my-2 my-sm-0" onClick={getRandomRecipe}>Random</button>
                        </form>
                        <br/>
                        <div id ="filters" class="row d-flex justify-content-center align-items-center h-100">
                          <FilterMenu filterType="mealTypes" title="Meal Type" callback={mealTypeCallback}></FilterMenu>
                          <FilterMenu filterType="cuisines" title="Cuisine" callback={cuisineCallback}></FilterMenu>
                          <FilterMenu filterType="diet" title="Diet" callback={dietCallback}></FilterMenu>
                          <FilterMenu filterType="intolerances" title="Intolerances" callback={intoleranceCallback}></FilterMenu>
                          <ToggleSwitch title ="Show Ingredient Substituttions" callback={strictSearchCallback} checked={strictSearch}></ToggleSwitch>
                        </div>
                      </div>
                    </div>
                    <div class="card-body smallBody">
                      <div id="smallForm" class="hide">
                        <form id="searchBar" class="form-inline" onSubmit={search}>
                          <input class="form-control mt-sm-4 mr-sm-3" ref={searchQueryRefSmall} type="text" placeholder="Search" aria-label="Search"/>
                          <button class="btn btn-outline mt-sm-4 my-2 my-sm-0" type="submit">Search</button>
                          <button class="btn btn-outline mt-sm-4 my-2 my-sm-0" onClick={getRandomRecipe}>Random</button>
                          <div id ="filters" class="row d-flex filterInline">
                            <FilterMenu filterType="mealTypes" title="Meal Type" callback={mealTypeCallback}></FilterMenu>
                            <FilterMenu filterType="cuisines" title="Cuisine" callback={cuisineCallback}></FilterMenu>
                            <FilterMenu filterType="diet" title="Diet" callback={dietCallback}></FilterMenu>
                            <FilterMenu filterType="intolerances" title="Intolerances" callback={intoleranceCallback}></FilterMenu>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="pageDisplay">
          <div>
            <RecipeList recipes={recipes} selectRecipe={selectRecipe} changeToGrid={changeToGrid}></RecipeList>
          </div>
          <div>
            <RecipeListDetails recipes={recipes} unselectRecipe={unselectRecipe} saveUnsaveRecipe={saveUnsaveRecipe}></RecipeListDetails>
          </div>
        </div>
      </div>

    </>
  );
}

export default SearchRecipes;