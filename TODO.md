# TODO - Fix Search navigation + TopUp/Razorpay issue

## Done/Now
- [x] Locate TopUp modal wiring (Proceed to payment button already calls onTopUp(amount)).
- [x] Identify Search navigation mismatch (HomeScreen navigates to 'Search').
- [x] Inspect backend Razorpay initialization (paymentService.js).

## Next steps
1. Fix Search navigation call: change `navigation.navigate('Search')` to `navigation.navigate('SearchHome')`. ✅ (done in HomeScreen)
2. Ensure backend can create Razorpay orders without 500:
   - verify environment variables are present (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, etc.)
   - if missing, payment feature will return 500 as “Payment configuration missing on server”.
3. Re-test:
   - TopUp -> Proceed to payment
   - Search -> opens Search screen without navigator warning.


