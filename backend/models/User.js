const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'ANALYSTE'], default: 'ANALYSTE' },
    lastLogin: { type: Date },
    settings: {
        emailNotifications: { type: Boolean, default: true },
        contactEmail: { type: String }
    }
}, { timestamps: true });

// 🔹 Hook pre-save correct — async sans next()
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return; // si le mot de passe n'a pas changé
    this.password = await bcrypt.hash(this.password, 10); // hash du mot de passe
});

// 🔹 Méthode pour comparer le mot de passe
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
