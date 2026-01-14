const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        // Seed TMA Admin
        const tmaEmail = 'vaishnavi@tma.com';
        const tmaUser = await User.findOne({ email: tmaEmail });
        if (!tmaUser) {
            console.log("Seeding TMA Admin...");
            await User.create({
                email: tmaEmail,
                password: await bcrypt.hash('TMA@vaishnavi', 10),
                name: 'Vaishnavi Gupta',
                avatarColor: '#1F2E4D',
                role: 'TMA',
                lastLogin: new Date().toISOString()
            });
        }

        const projectCount = await Project.countDocuments();
        if (projectCount === 0) {
            console.log("Seeding default project...");
            const defaultProject = await Project.create({
                name: 'My Kanban Project',
                key: 'KAN',
                type: 'Software',
                lead: 'Piyush Gaygole',
                iconColor: '#1F2E4D'
            });

            const taskCount = await Task.countDocuments();
            if (taskCount === 0) {
                console.log("Seeding default task...");
                const now = new Date().toISOString();
                const startDate = new Date();
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 2);

                await Task.create({
                    key: 'KAN-1',
                    title: 'Create Task Management Software',
                    description: 'Initial setup',
                    assignee: 'Unassigned',
                    reporter: 'Piyush Gaygole',
                    priority: 'Medium',
                    status: 'TO DO',
                    resolution: 'Unresolved',
                    created: now,
                    updated: now,
                    startDate: startDate.toISOString(),
                    dueDate: dueDate.toISOString(),
                    parentId: null,
                    projectId: defaultProject._id
                });
            }
        }
    } catch (err) {
        console.error("Seeding error:", err);
    }
};

module.exports = seedData;
