package com.community.app.infrastructure.firebase;

public interface FirebaseServicePort {
    String createUser(String email, String password, String displayName);
    String createCustomToken(String uid);
}
