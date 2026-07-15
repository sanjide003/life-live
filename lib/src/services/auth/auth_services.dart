import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:google_sign_in/google_sign_in.dart';

import '../sync_services.dart';

abstract class OptionalAuthService {
  AuthState get currentUser;
  Future<AuthState> signInWithGoogle();
  Future<AuthState> signOut();
}

class FakeGoogleAuthService implements OptionalAuthService {
  FakeGoogleAuthService([this._state = const AuthState.signedOut()]);

  AuthState _state;

  @override
  AuthState get currentUser => _state;

  @override
  Future<AuthState> signInWithGoogle() async {
    _state = const AuthState.signedIn(displayName: 'Livelife User', email: 'user@example.com');
    return _state;
  }

  @override
  Future<AuthState> signOut() async {
    _state = const AuthState.signedOut();
    return _state;
  }
}

// Production adapter. Kept behind the OptionalAuthService boundary so tests and
// local-first usage can use FakeGoogleAuthService without Firebase initialization.
class FirebaseGoogleAuthService implements OptionalAuthService {
  FirebaseGoogleAuthService({firebase_auth.FirebaseAuth? firebaseAuth, GoogleSignIn? googleSignIn})
      : firebaseAuth = firebaseAuth ?? firebase_auth.FirebaseAuth.instance,
        googleSignIn = googleSignIn ?? GoogleSignIn();

  final firebase_auth.FirebaseAuth firebaseAuth;
  final GoogleSignIn googleSignIn;
  AuthState _state = const AuthState.signedOut();

  @override
  AuthState get currentUser => _state;

  @override
  Future<AuthState> signInWithGoogle() async {
    final googleUser = await googleSignIn.signIn();
    if (googleUser == null) {
      return _state;
    }
    final googleAuth = await googleUser.authentication;
    final credential = firebase_auth.GoogleAuthProvider.credential(accessToken: googleAuth.accessToken, idToken: googleAuth.idToken);
    final result = await firebaseAuth.signInWithCredential(credential);
    final user = result.user;
    _state = AuthState.signedIn(displayName: user?.displayName ?? 'Livelife User', email: user?.email ?? 'unknown@example.com');
    return _state;
  }

  @override
  Future<AuthState> signOut() async {
    await googleSignIn.signOut();
    await firebaseAuth.signOut();
    _state = const AuthState.signedOut();
    return _state;
  }
}
