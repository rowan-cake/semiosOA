

1. **Architecture** — How did you structure components, data fetching, state and types, and why? What did you build first, and what did you deliberately leave out?
  - First thing I built was the frostMonitoring.ts module. I had it as a simple function returning a boolean if that field is under frost risk based on the logic provied. 
  - I used the useState() function from react in order to manage state.
  - I used the geters from the mockApi.ts to fetch data and then the react function "useEffect()" to fetch data again.
  - I had two main structure decisions to make for the FieldDetail.tsx and also frostMonitoring.ts. 
    1. I wrote them in different files to allow for extensibilty and keeping in favour of the principles of modular design.     
    2. Second was for the construction of the two seprate methods in `frostMonitoring.ts` this is so different callers need different amounts of information, while the calculation lives in one place.
      this is why one is a simple boolean and the other returns a boolean and the coldest temp in the last 7 days.

2. **Edge cases and assumptions** — Where does the frost-risk logic live, and why there? How did you handle null readings, slow responses and failed requests?
  - Frost risk logic lives in the file `frostMonitoring.ts` and this is explained above but mainly for good SOLID princples. 
  - Null readings are simply skipped , edge case is if all readings are null then the frost risk reports true(farmer would want this I think)
  - Slow respones are just waited displaying a loading message and failed requests fail gracefully with a retry button and no blank screen.
3. **Scale and reuse** — What would break or slow down at 500 fields and 20,000 stations, and what would you change in rendering, data fetching and the API? Which components would you move into a shared component library?
  - I think at 500 fields and 20,000 stations this could become a problem because everything is in memory at the moment so it may begen to grow to large. I would change the API to have paganation and also I would probably want to use a database to hold the information of the weather stations and crops and such so that its more effiecent overall.
  - I would also cache fetched data to avoid repeating requests when navigating back to a field. I am unsure on how to do this now , Ive heard of something called redis that makes in memory storage much faster but I dont know how it works.

4. **Testing** — Why these tests? What would you test next with more time? Also include the AI usage section described below.
  - Two unit tests 
    1. the first tests the frost boundary condtion of 0C. This is good practice to test at the boundary in software eng because this is usally where bugs lie. 
    2. The second was to make sure if all the weather stations are reporting null for the last 7 day period that the frost warning is sent. The farmer would want this 
      because at least he will have some idea that there is a problem with the weather stations.
  - The component integration test was making fake API failure and verify that the user can retry successfully using the keyboard. Another checks keyboard station selection and that the selected station’s chart appears. 


## Using AI tools

Which tools you used, and for which parts (e.g. scaffolding, components, tests, styling) **One example where the AI output was wrong, incomplete, or not what you wanted**, and how you noticed and fixed it Anything you chose to write by hand, and why

I used AI(Codex) for the entire build overall , I leaned on it more heavily in the App.tsx and in the final tests. 

One example of something I did not like was its design choice for the cards, I noticed this in its description of the plan it wanted to "On the detail screen, stack one card per station. Show its recent daily lows, a simple trend indicator, and an Offline badge when neither of the two most recent days has a reported temperature." I did not like this aproach and changed course by looking for
something simpler that, I was also thinking on how to make it look best on mobile. I rebutled with "organized visually in space, and after you click on one of them, then it shows its temperature reading chart."

Another was it did not add axis to the chart at first , I noticed this visually and got a fix in after. 


I chose to wrote the intial `fieldAtRiskofFrost()` function by hand so that I could understand the logic and have a good idea of how the data will flow the application(This function was later rewritten into two functions as I diccused earlier by AI but V1 was mine).