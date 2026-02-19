import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ProfileId = Nat;
  type Username = Text;
  type Language = Text;

  public type Message = {
    sender : Principal;
    recipient : Principal;
    timestamp : Int;
    content : Text;
  };

  public type MatchAction = {
    user : Principal;
    timestamp : Int;
  };

  public type UserProfile = {
    fullName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
    nativeLanguages : [Language];
    targetLanguages : [Language];
    lastActive : Int;
    matches : [Principal];
    sentMatchRequests : [Principal];
    receivedMatchRequests : [Principal];
    currentStatus : Status;
    lastMessageCheck : Int;
  };

  public type Status = { #active; #offline };
  public type ShortProfile = {
    fullName : Text;
    age : Nat;
    bio : Text;
    nativeLanguages : [Language];
    targetLanguages : [Language];
    currentStatus : Status;
  };

  module UserProfile {
    public func fromShortProfile(shortProfile : ShortProfile) : UserProfile {
      {
        fullName = shortProfile.fullName;
        age = shortProfile.age;
        bio = shortProfile.bio;
        interests = [];
        nativeLanguages = shortProfile.nativeLanguages;
        targetLanguages = shortProfile.targetLanguages;
        lastActive = Time.now();
        matches = [];
        sentMatchRequests = [];
        receivedMatchRequests = [];
        currentStatus = #offline;
        lastMessageCheck = Time.now();
      };
    };
  };

  let users = Map.empty<Principal, UserProfile>();

  // Matching Logic
  let pendingMatches = Map.empty<Principal, List.List<MatchAction>>();

  // Messaging
  let messages = Map.empty<Principal, List.List<Message>>();
  let activeProfiles = Map.empty<Principal, Status>();

  /// Converts internal list of matches to an array and clears the list.
  func getAndClearMatches(matchesList : List.List<MatchAction>) : [MatchAction] {
    let matchesArray = matchesList.toArray();
    matchesList.clear();
    matchesArray;
  };

  /// Helper function to check if two users are mutually matched
  func areMutuallyMatched(user1 : Principal, user2 : Principal) : Bool {
    switch (users.get(user1), users.get(user2)) {
      case (?profile1, ?profile2) {
        let user1HasUser2 = profile1.matches.find(func(p) { p == user2 });
        let user2HasUser1 = profile2.matches.find(func(p) { p == user1 });
        switch (user1HasUser2, user2HasUser1) {
          case (?_, ?_) { true };
          case _ { false };
        };
      };
      case _ { false };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getCurrentUserProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func createUserProfile(profileData : ShortProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profile");
    };
    if (users.containsKey(caller)) {
      Runtime.trap("Profile already exists");
    };
    let newProfile = UserProfile.fromShortProfile(profileData);

    users.add(caller, newProfile);
    messages.add(caller, List.empty<Message>());
  };

  // Matching System
  public shared ({ caller }) func likeUser(user : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like users");
    };
    if (user == caller) { Runtime.trap("Cannot match with yourself") };

    switch (users.get(user)) {
      case (null) { Runtime.trap("No such user found") };
      case (?_) {
        let matchAction : MatchAction = {
          user = caller;
          timestamp = Time.now();
        };

        switch (pendingMatches.get(user)) {
          case (null) {
            pendingMatches.add(user, List.fromArray<MatchAction>([matchAction]));
          };
          case (?matchesList) {
            matchesList.add(matchAction);
          };
        };

        // Update user's matches
        switch (users.get(caller)) {
          case (null) { Runtime.trap("Current user not found") };
          case (?profile) {
            let updatedUser : UserProfile = {
              profile with
              sentMatchRequests = [user];
            };
            users.add(caller, updatedUser);
          };
        };

        true;
      };
    };
  };

  public shared ({ caller }) func getMatches() : async [MatchAction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get matches");
    };
    switch (pendingMatches.get(caller)) {
      case (null) { [] };
      case (?matchesList) { getAndClearMatches(matchesList) };
    };
  };

  // Messaging
  public shared ({ caller }) func sendMessage(recipient : Principal, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    // Verify both users exist
    switch (users.get(caller), users.get(recipient)) {
      case (?_, ?_) {
        // Verify mutual match before allowing messaging
        if (not areMutuallyMatched(caller, recipient)) {
          Runtime.trap("Unauthorized: Can only message mutually matched users");
        };
      };
      case _ {
        Runtime.trap("Sender or recipient not found");
      };
    };

    let messageObj : Message = {
      sender = caller;
      recipient;
      timestamp = Time.now();
      content = message;
    };

    for (user in [caller, recipient].values()) {
      switch (messages.get(user)) {
        case (null) {
          let newList = List.fromArray<Message>([messageObj]);
          messages.add(user, newList);
        };
        case (?existingMessages) {
          existingMessages.add(messageObj);
        };
      };
    };
  };

  public query ({ caller }) func getMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get messages");
    };
    switch (messages.get(caller)) {
      case (null) { [] };
      case (?userMessages) { userMessages.toArray() };
    };
  };

  // Returns only the most "active" participants
  public query func getCurrentActiveParticipants() : async [(Principal, Status)] {
    activeProfiles.entries().toArray();
  };
};
