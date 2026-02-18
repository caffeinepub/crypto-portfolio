import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
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
    user : Principal;
    asset : Text;
    quantity : Float;
    costBasis : ?Float;
    timestamp : Time.Time;
  };

  module Holding {
    public func compareByAsset(h1 : Holding, h2 : Holding) : Order.Order {
      Text.compare(h1.asset, h2.asset);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let holdings = Map.empty<Principal, [Holding]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

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
      user = caller;
      asset;
      quantity;
      costBasis;
      timestamp = Time.now();
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

  public shared ({ caller }) func updateHolding(asset : Text, newQuantity : Float, newCostBasis : ?Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    switch (holdings.get(caller)) {
      case (null) {
        Runtime.trap("Holding does not exist");
      };
      case (?userHoldings) {
        let holdingExists = userHoldings.any(
          func(h) {
            h.asset == asset;
          }
        );
        if (holdingExists) {
          let updatedHoldings = userHoldings.map(
            func(h) {
              if (Text.equal(h.asset, asset)) {
                {
                  h with
                  quantity = newQuantity;
                  costBasis = newCostBasis;
                  timestamp = Time.now();
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
        userHoldings.find(
          func(h) {
            Text.equal(h.asset, asset);
          }
        );
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
        userHoldings.filter(
          func(h) {
            Text.equal(h.asset, asset);
          }
        );
      };
    };
  };

  public query ({ caller }) func getAllHoldings() : async [Holding] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all holdings");
    };
    holdings.values().toArray().flatten().sort(Holding.compareByAsset);
  };
};
