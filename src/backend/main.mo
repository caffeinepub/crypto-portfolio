import Array "mo:core/Array";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
// import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types and helper modules
  module Change {
    public type Quantity = {
      #increase : Float;
      #decrease : Float;
    };

    public type HoldingChange = {
      originalQuantity : Float;
      change : Quantity;
      timestamp : Time.Time;
    };
  };

  public type Holding = {
    asset : Text;
    quantity : Float;
    costBasis : ?Float;
    purchaseDate : Time.Time;
    saleHistory : [SaleRecord];
    currentQuantity : Float;
  };

  public type SaleRecord = {
    quantitySold : Float;
    salePrice : Float;
    saleDate : Time.Time;
  };

  public type Transaction = {
    assetSymbol : Text;
    transactionType : TransactionType;
    shares : Float;
    pricePerShare : ?Float;
    date : Time.Time;
    totalValue : Float;
  };

  public type TransactionType = {
    #buy : Float;
    #sell : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  module Holding {
    public func compareByAsset(h1 : Holding, h2 : Holding) : Order.Order {
      Text.compare(h1.asset, h2.asset);
    };

    public func compareByPurchaseDateDescending(a : Holding, b : Holding) : Order.Order {
      if (a.purchaseDate > b.purchaseDate) { #less } else if (a.purchaseDate < b.purchaseDate) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // State
  let holdings = Map.empty<Principal, [Holding]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Public API
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addHolding(asset : Text, quantity : Float, costBasis : ?Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    let holding : Holding = {
      asset;
      quantity;
      costBasis;
      purchaseDate = Time.now();
      saleHistory = [];
      currentQuantity = quantity;
    };
    let existing = holdings.get(caller);
    switch (existing) {
      case (null) {
        holdings.add(caller, [holding]);
      };
      case (?existingHoldings) {
        holdings.add(caller, existingHoldings.concat([holding]));
      };
    };
  };

  public query ({ caller }) func getHoldings() : async [Holding] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) { [] };
      case (?userHoldings) { userHoldings };
    };
  };

  public query ({ caller }) func getArchivedHoldings() : async [Holding] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) { [] };
      case (?userHoldings) {
        userHoldings.filter(func(h) { h.currentQuantity == 0.0 });
      };
    };
  };

  public shared ({ caller }) func updateHolding(asset : Text, newQuantity : Float, newCostBasis : ?Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) {
        Runtime.trap("Holding does not exist");
      };
      case (?userHoldings) {
        let holdingExists = userHoldings.any(func(h) { h.asset == asset });
        if (holdingExists) {
          let updatedHoldings = userHoldings.map(
            func(h) {
              if (Text.equal(h.asset, asset)) {
                {
                  h with
                  quantity = newQuantity;
                  costBasis = newCostBasis;
                  currentQuantity = newQuantity;
                };
              } else { h };
            }
          );
          holdings.add(caller, updatedHoldings);
        } else {
          Runtime.trap("Holding does not exist");
        };
      };
    };
  };

  public shared ({ caller }) func deleteHolding(asset : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) { () };
      case (?userHoldings) {
        let filteredHoldings = userHoldings.filter(
          func(h) { not Text.equal(h.asset, asset) }
        );
        holdings.add(caller, filteredHoldings);
      };
    };
  };

  public query ({ caller }) func getHolding(asset : Text) : async ?Holding {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) { null };
      case (?userHoldings) {
        userHoldings.find(func(h) { Text.equal(h.asset, asset) });
      };
    };
  };

  public query ({ caller }) func findHoldingsByAsset(asset : Text) : async [Holding] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) { [] };
      case (?userHoldings) {
        userHoldings.filter(func(h) { Text.equal(h.asset, asset) });
      };
    };
  };

  public query ({ caller }) func getAllHoldings() : async [Holding] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all holdings");
    };
    holdings.values().toArray().flatten().sort(Holding.compareByAsset);
  };

  public shared ({ caller }) func recordSale(asset : Text, quantitySold : Float, salePrice : Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) {
        Runtime.trap("No holdings found for user");
      };
      case (?userHoldings) {
        let updatedHoldings = userHoldings.map(
          func(h) {
            if (Text.equal(h.asset, asset) and h.currentQuantity >= quantitySold) {
              let saleRecord = {
                quantitySold;
                salePrice;
                saleDate = Time.now();
              };
              {
                h with
                saleHistory = h.saleHistory.concat([saleRecord]);
                currentQuantity = h.currentQuantity - quantitySold;
              };
            } else { h };
          }
        );
        holdings.add(caller, updatedHoldings);
      };
    };
  };

  public query ({ caller }) func calculateProfitLoss() : async { totalProfitLoss : Float; totalSold : Nat } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };

    let userHoldings = switch (holdings.get(caller)) {
      case (null) { [] };
      case (?holds) { holds };
    };

    var totalProfitLoss = 0.0;
    var totalSold = 0;

    for (holding in userHoldings.values()) {
      let sales = holding.saleHistory;
      for (sale in sales.values()) {
        switch (holding.costBasis) {
          case (?costBasis) {
            totalProfitLoss += (sale.salePrice - costBasis) * sale.quantitySold;
            totalSold += 1;
          };
          case (null) {};
        };
      };
    };

    { totalProfitLoss; totalSold };
  };

  public query ({ caller }) func getTransactionHistory(asset : Text) : async [Holding] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) { [] };
      case (?userHoldings) {
        let filtered = userHoldings.filter(func(h) { h.asset == asset });
        filtered.sort(Holding.compareByPurchaseDateDescending);
      };
    };
  };

  public query ({ caller }) func getUnsoldHoldings() : async [Holding] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) { [] };
      case (?userHoldings) { userHoldings.filter(func(h) { h.currentQuantity > 0.0 }) };
    };
  };

  public query ({ caller }) func getFullArchive() : async [Holding] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view the full archive");
    };
    holdings.values().toArray().flatten().filter(func(h) { h.currentQuantity == 0.0 });
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access transaction history");
    };

    var transactions : [Transaction] = [];

    switch (holdings.get(caller)) {
      case (null) {};
      case (?userHoldings) {
        // Add buys
        for (holding in userHoldings.values()) {
          transactions := transactions.concat([{
            assetSymbol = holding.asset;
            transactionType = #buy(holding.quantity);
            shares = holding.quantity;
            pricePerShare = holding.costBasis;
            date = holding.purchaseDate;
            totalValue = switch (holding.costBasis) {
              case (?price) { holding.quantity * price };
              case (null) { (0.0 : Float) };
            };
          }]);

          // Add sales
          for (sale in holding.saleHistory.values()) {
            transactions := transactions.concat([{
              assetSymbol = holding.asset;
              transactionType = #sell(sale.quantitySold);
              shares = sale.quantitySold;
              pricePerShare = ?sale.salePrice;
              date = sale.saleDate;
              totalValue = sale.quantitySold * sale.salePrice;
            }]);
          };
        };
      };
    };

    transactions;
  };
};
