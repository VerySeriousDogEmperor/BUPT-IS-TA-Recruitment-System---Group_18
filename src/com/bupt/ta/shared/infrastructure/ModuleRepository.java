package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.CourseModule;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 模块数据仓储
 */
public class ModuleRepository {
    
    public List<CourseModule> findAll() throws IOException {
        return DataStore.loadModules();
    }
    
    public Optional<CourseModule> findById(String id) throws IOException {
        List<CourseModule> modules = DataStore.loadModules();
        return modules.stream()
                .filter(m -> m.getId().equals(id))
                .findFirst();
    }
    
    public List<CourseModule> findByMoId(String moId) throws IOException {
        List<CourseModule> modules = DataStore.loadModules();
        return modules.stream()
                .filter(m -> m.getMoId().equals(moId))
                .collect(Collectors.toList());
    }
    
    public void save(CourseModule module) throws IOException {
        List<CourseModule> modules = DataStore.loadModules();
        
        boolean exists = false;
        for (int i = 0; i < modules.size(); i++) {
            if (modules.get(i).getId().equals(module.getId())) {
                modules.set(i, module);
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            modules.add(module);
        }
        
        DataStore.saveModules(modules);
    }
    
    public void delete(String id) throws IOException {
        List<CourseModule> modules = DataStore.loadModules();
        modules = modules.stream()
                .filter(m -> !m.getId().equals(id))
                .collect(Collectors.toList());
        DataStore.saveModules(modules);
    }
    
    public String generateId() throws IOException {
        List<CourseModule> modules = DataStore.loadModules();
        int maxId = 0;
        for (CourseModule m : modules) {
            if (m.getId().startsWith("MOD")) {
                try {
                    int id = Integer.parseInt(m.getId().substring(3));
                    if (id > maxId) {
                        maxId = id;
                    }
                } catch (NumberFormatException e) {
                    // 忽略
                }
            }
        }
        return String.format("MOD%03d", maxId + 1);
    }
}
