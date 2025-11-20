# 🤝 Guide de Contribution

Merci de vouloir contribuer à **Open-Code Collective AI** ! 

Ce projet vit grâce à **deux types de contributions** :

1. 🎯 **Contribution de Code** (Principal) - Partagez vos repos GitHub
2. 🛠️ **Amélioration de la Plateforme** (Secondaire) - Améliorez le code du projet

---

## 🎯 Type 1 : Contribuer Votre Code (Principal)

### Pourquoi Contribuer ?

En partageant vos repos publics, vous :
- 💎 **Gagnez des crédits** (3-15 par repo selon qualité)
- 🌍 **Enrichissez le dataset global** (aide des milliers de devs)
- 🏆 **Obtenez des badges** (reconnaissance communauté)
- 📈 **Améliorez l'IA collective** (plus de code = IA plus intelligente)

### Prérequis

- ✅ Compte GitHub avec repos publics
- ✅ Repos avec **licence compatible** (MIT, Apache 2.0, BSD, CC0, Unlicense)
- ✅ Code **sans secrets/tokens** (vérification automatique)
- ✅ Acceptation du traitement par IA

### Processus de Contribution

#### Étape 1 : Inscription

1. Visitez la plateforme : [opencode-collective.ai](https://opencode-collective.ai)
2. Cliquez **"Connexion"**
3. Entrez votre **username GitHub**
4. Créez un **Personal Access Token** :
   - Allez sur [github.com/settings/tokens](https://github.com/settings/tokens)
   - Générez un token **Classic**
   - Permissions : `repo` (lecture seule) + `user` (profil)
   - Copiez le token : `ghp_...`
5. Collez le token et validez

🎉 **Vous recevez 10 crédits gratuits !**

#### Étape 2 : Sélection de Repos

1. Onglet **📦 Mes Repos**
2. Cliquez **"🔄 Charger mes repos"**
3. Vos repos publics s'affichent avec :
   - 🟢 Badge vert = Licence compatible
   - 🟡 Badge jaune = Licence à vérifier
   - 🔴 Badge rouge = Licence incompatible (GPL, etc.)
4. **Cochez** les repos que vous voulez partager
5. Cliquez **"✅ Contribuer les repos sélectionnés"**

#### Étape 3 : Traitement Automatique

Notre système va :

1. **Cloner** le repo (shallow, pas d'historique)
2. **Vérifier** :
   - ✅ Licence compatible
   - ✅ Pas de secrets/tokens (filtrage automatique)
   - ✅ Code valide (syntaxe)
   - ✅ Pas de malware
3. **Extraire** le code pertinent (fichiers source uniquement)
4. **Générer** des embeddings (représentations vectorielles)
5. **Ajouter** au dataset global (anonymisé)
6. **Créditer** votre compte

⏱️ **Temps moyen : 2-5 minutes par repo**

#### Étape 4 : Recevoir les Crédits

Vous recevez des crédits selon :

| Critère | Crédits |
|---------|---------|
| **Taille** | |
| Petit repo (<10 fichiers) | +3 |
| Moyen (10-50 fichiers) | +5 |
| Grand (50-100 fichiers) | +10 |
| Énorme (100+ fichiers) | +15 |
| **Qualité** | |
| Tests présents | +2 |
| README détaillé | +2 |
| CI/CD configuré | +1 |
| **Popularité** | |
| 10-100 stars | +3 |
| 100-1K stars | +5 |
| 1K+ stars | +10 |

**Exemple** : 
```
Repo Next.js avec :
- 50 fichiers → +5
- Tests Jest → +2
- README complet → +2
- 150 stars → +3
Total : +12 crédits ✅
```

### Maintenance Continue

Si votre repo reste actif (commits réguliers) :
- 🔄 **+2 crédits/mois automatiques**
- 📊 Mise à jour du dataset tous les 7 jours
- 🏆 Badge "Active Contributor"

Si inactif >6 mois :
- ⏸️ Crédits automatiques suspendus
- 📦 Code reste dans le dataset
- 🔄 Réactivation possible

### Retirer un Repo

Vous pouvez retirer un repo à tout moment :

1. Onglet **📦 Mes Repos**
2. Cliquez sur le repo
3. **"🗑️ Retirer du dataset"**
4. Confirmation

⏱️ **Suppression effective sous 24h**

---

## 🛠️ Type 2 : Améliorer la Plateforme (Secondaire)

Vous pouvez aussi contribuer au **code du projet** lui-même.

### Types de Contributions Acceptées

- 🐛 **Bug fixes** (correctifs)
- 📝 **Documentation** (README, guides)
- 🌍 **Traductions** (i18n)
- ♿ **Accessibilité** (a11y)
- 🎨 **UI/UX** (design, ergonomie)
- ⚡ **Performance** (optimisations)
- 🧪 **Tests** (unitaires, intégration)

### Types de Contributions NON Acceptées

- ❌ Features qui fragmentent la plateforme (multi-instances)
- ❌ Changements d'architecture majeurs (sans discussion préalable)
- ❌ Modifications du modèle économique
- ❌ Extraction du dataset pour usage externe

### Processus de Contribution Code

#### 1. Avant de Commencer

- 🔍 **Vérifiez les issues existantes** : [Issues](../../issues)
- 💬 **Discutez d'abord** pour les gros changements : [Discussions](../../discussions)
- 📖 **Lisez le code** : Architecture NEXUS AXION 3.5

#### 2. Setup Local

```bash
# Fork le repo sur GitHub

# Clone votre fork
git clone https://github.com/VOTRE-USERNAME/open-code-collective-ai.git
cd open-code-collective-ai

# Ajouter upstream
git remote add upstream https://github.com/anzizedaouda/open-code-collective-ai.git

# Installer dépendances
npm install

# Créer .env (demandez les credentials sur Discord)
cp .env.example .env

# Lancer en dev
npm run dev
```

#### 3. Créer une Branche

```bash
# Branche depuis main
git checkout main
git pull upstream main

# Créer branche feature
git checkout -b feature/ma-super-feature

# OU branche bugfix
git checkout -b fix/correction-bug-xyz
```

**Convention de nommage** :
- `feature/` : Nouvelles fonctionnalités
- `fix/` : Corrections de bugs
- `docs/` : Documentation
- `refactor/` : Refactoring
- `test/` : Tests

#### 4. Développer

**Respectez** :
- ✅ Architecture NEXUS AXION 3.5 (3 fichiers racine)
- ✅ Style de code existant
- ✅ Commentaires clairs
- ✅ Pas de dépendances inutiles

**Testez** :
```bash
# Tests manuels
npm run dev

# Health check
curl http://localhost:3000/health

# Tests automatisés (à venir)
npm test
```

#### 5. Commit

**Format de commit** :
```
type(scope): description courte

Description détaillée (optionnel)

Fixes #123
```

**Types** : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Exemples** :
```bash
git commit -m "feat(repos): ajout filtre par langage"
git commit -m "fix(credits): correction calcul crédits repos"
git commit -m "docs(readme): ajout section FAQ"
```

#### 6. Push et Pull Request

```bash
# Push vers votre fork
git push origin feature/ma-super-feature
```

Sur GitHub :
1. Allez sur votre fork
2. Cliquez **"Compare & Pull Request"**
3. Remplissez le template (auto-généré)
4. Soumettez la PR

### Review Process

1. ✅ **Checks automatiques** (lint, build)
2. 👀 **Review par un maintainer** (24-48h)
3. 💬 **Discussion** si changements nécessaires
4. 🎉 **Merge** si approuvé

### Après le Merge

- 🏆 Vous êtes ajouté à la liste des contributeurs
- 📢 Mention dans le CHANGELOG
- 💎 +50 crédits bonus (remerciement)

---

## 📋 Checklist Avant Soumission

### Pour Contribution Code (Repos)

- [ ] Mon repo est **public** sur GitHub
- [ ] Mon repo a une **licence compatible** (MIT, Apache, BSD, CC0, Unlicense)
- [ ] Mon code ne contient **pas de secrets** (ou je les ai retirés)
- [ ] J'ai vérifié que mon code est **valide** (compile/exécute)
- [ ] J'accepte que mon code soit **traité par IA**
- [ ] J'accepte que mon code soit **anonymisé** dans le dataset global

### Pour Contribution Plateforme (PR)

- [ ] J'ai **discuté** du changement (si majeur)
- [ ] Mon code suit l'**architecture NEXUS AXION 3.5**
- [ ] J'ai **testé** localement
- [ ] Mes commits suivent le **format conventionnel**
- [ ] J'ai **documenté** les changements (si nécessaire)
- [ ] J'ai vérifié qu'il n'y a **pas de secrets** dans le code
- [ ] Ma PR a une **description claire**

---

## 🎯 Priorités Actuelles

Contributions particulièrement recherchées :

### High Priority

- 🐛 Tests automatisés (Jest, Playwright)
- 📚 Documentation technique détaillée
- 🌍 Traductions (EN, ES, DE, FR)
- ♿ Améliorations accessibilité (WCAG 2.1)

### Medium Priority

- 🎨 Amélioration UI/UX
- ⚡ Optimisations performance
- 📊 Dashboard analytics avancé
- 🔍 Recherche sémantique améliorée

### Low Priority (Future)

- 🔌 Intégrations (VSCode plugin, CI/CD)
- 🤖 Agents autonomes
- 🎮 Gamification avancée

---

## 💬 Communication

### Channels

- 💬 **Discussions Générales** : [GitHub Discussions](../../discussions)
- 🐛 **Bugs** : [Issues](../../issues/new?template=bug_report.md)
- 💡 **Features** : [Feature Requests](../../issues/new?template=feature_request.md)
- 📧 **Email** : contact@opencode-collective.ai
- 🗨️ **Discord** : [Rejoindre](https://discord.gg/opencode-ai)

### Temps de Réponse

- 🐛 **Bugs critiques** : <24h
- 💡 **Feature requests** : 2-5 jours
- 📝 **PRs** : 24-48h (premier review)
- 💬 **Questions** : 1-3 jours

---

## 🏆 Reconnaissance

### Tous les Contributeurs

- 📝 Ajoutés au README (section Contributors)
- 🎖️ Badge sur votre profil GitHub
- 💎 Crédits bonus (50-200 selon contribution)

### Top Contributors

- 🥇 Mention spéciale
- 🎁 Swag exclusif (stickers, t-shirt)
- 🎤 Invitation à co-présenter le projet

### Founding Members

Si vous contribuez **avant 1000 users** :
- 🏅 Badge "Founding Member" permanent
- 💎 +100 crédits à vie
- 🎯 Accès beta features en priorité
- 📣 Voix dans les décisions stratégiques

---

## 🚫 Code de Conduite

En contribuant, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md).

**En résumé** :
- ✅ Respectueux et inclusif
- ✅ Feedback constructif
- ✅ Collaboration bienveillante
- ❌ Harcèlement de toute forme
- ❌ Trolling ou spam
- ❌ Contenu offensant

---

## ❓ Questions Fréquentes

### Je contribue un repo privé ?

**Non.** Seuls les repos **publics** sont acceptés. Votre token GitHub n'a que les permissions de lecture publique.

### Mon code sera-t-il attribué ?

Dans le dataset global, le code est **anonymisé** (pas d'attribution directe). Seules les métadonnées (langage, structure) sont conservées.

Vous gardez tous vos droits de propriété intellectuelle.

### Et si ma PR est rejetée ?

Pas de panique ! Nous vous expliquons pourquoi et suggérons des améliorations. C'est une opportunité d'apprendre.

### Combien de temps pour merger une PR ?

**Premier review : 24-48h**  
**Merge : 3-7 jours** (si approuvée)

Pour accélérer :
- ✅ PR petites et focalisées
- ✅ Tests inclus
- ✅ Description claire

---

## 🙏 Merci !

Chaque contribution, petite ou grande, fait avancer le projet.

**Vous êtes en train de construire quelque chose d'unique : le premier dataset de code véritablement collaboratif.**

Merci de faire partie de cette aventure ! 🚀

---

<div align="center">

**Des questions ?** [Ouvrir une discussion](../../discussions) • [Contact](mailto:contact@opencode-collective.ai)

</div>