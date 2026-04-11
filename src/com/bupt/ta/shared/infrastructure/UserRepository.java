package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.User;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 用户数据仓储（MO、Admin）
 */
public class UserRepository {
    
    public List<User> findAll() throws IOException {
        return DataStore.loadUsers();
    }
    
    public Optional<User> findById(String id) throws IOException {
        List<User> users = DataStore.loadUsers();
        return users.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst();
    }
    
    public Optional<User> findByEmail(String email) throws IOException {
        List<User> users = DataStore.loadUsers();
        return users.stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst();
    }
    
    public List<User> findByRole(String role) throws IOException {
        List<User> users = DataStore.loadUsers();
        return users.stream()
                .filter(u -> u.getRole().equals(role))
                .collect(Collectors.toList());
    }
    
    public void save(User user) throws IOException {
        List<User> users = DataStore.loadUsers();
        
        boolean exists = false;
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getId().equals(user.getId())) {
                users.set(i, user);
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            users.add(user);
        }
        
        DataStore.saveUsers(users);
    }
    
    public void delete(String id) throws IOException {
        List<User> users = DataStore.loadUsers();
        users = users.stream()
                .filter(u -> !u.getId().equals(id))
                .collect(Collectors.toList());
        DataStore.saveUsers(users);
    }
    
    public String generateId(String role) throws IOException {
        List<User> users = DataStore.loadUsers();
        String prefix = role.equals("mo") ? "MO" : "ADMIN";
        int maxId = 0;
        
        for (User u : users) {
            if (u.getId().startsWith(prefix)) {
                try {
                    int id = Integer.parseInt(u.getId().substring(prefix.length()));
                    if (id > maxId) {
                        maxId = id;
                    }
                } catch (NumberFormatException e) {
                    // 忽略
                }
            }
        }
        return String.format("%s%03d", prefix, maxId + 1);
    }
}
