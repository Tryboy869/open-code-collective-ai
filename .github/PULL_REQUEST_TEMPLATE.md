## 📝 Description

Décrivez clairement les changements apportés.

**Type de changement:**
- [ ] 🐛 Bug fix (changement qui corrige un problème)
- [ ] ✨ Nouvelle feature (changement qui ajoute une fonctionnalité)
- [ ] 💥 Breaking change (fix ou feature qui casserait la compatibilité)
- [ ] 📝 Documentation (changements dans la documentation)
- [ ] 🎨 Style (formatage, espaces, etc. - pas de changement de code)
- [ ] ♻️ Refactor (ni bug fix ni feature)
- [ ] ⚡ Performance (amélioration des performances)
- [ ] ✅ Tests (ajout/correction de tests)

## 🔗 Issue Liée

Fixes #(numéro de l'issue)

Si cette PR résout plusieurs issues: Fixes #123, Fixes #456

## 🎯 Motivation & Contexte

Pourquoi ce changement est-il nécessaire ? Quel problème résout-il ?

**Contexte:**
- Que faisiez-vous quand vous avez identifié le besoin ?
- Y a-t-il des discussions liées ?

## 📋 Changements Apportés

Liste détaillée des modifications :

- [ ] Changement 1
- [ ] Changement 2
- [ ] Changement 3

**Fichiers modifiés:**
- `index.html` - Description des changements
- `api.js` - Description des changements
- `server.js` - Description des changements

## 🧪 Tests Effectués

Décrivez les tests que vous avez effectués pour vérifier vos changements.

**Scénarios de test:**
1. Test 1
   - Étapes : ...
   - Résultat attendu : ...
   - Résultat obtenu : ✅

2. Test 2
   - Étapes : ...
   - Résultat attendu : ...
   - Résultat obtenu : ✅

**Environnement de test:**
- OS: [ex: Windows 11, macOS 14]
- Browser: [ex: Chrome 120]
- Node version: [ex: 18.19.0]

## 📸 Screenshots

Si applicable, ajoutez des screenshots pour montrer les changements visuels.

**Avant:**
<!-- Screenshot de l'ancien comportement -->

**Après:**
<!-- Screenshot du nouveau comportement -->

## ✅ Checklist

**Code Quality:**
- [ ] Mon code suit le style du projet (NEXUS AXION 3.5)
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté mon code, particulièrement dans les zones complexes
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests qui prouvent que mon fix/feature fonctionne
- [ ] Les tests unitaires existants passent localement

**Security:**
- [ ] Mon code ne contient pas de secrets/tokens hardcodés
- [ ] J'ai vérifié qu'il n'y a pas de nouvelles vulnérabilités
- [ ] Les dépendances ajoutées sont sûres et nécessaires

**Documentation:**
- [ ] J'ai mis à jour le README si nécessaire
- [ ] J'ai mis à jour CHANGELOG.md
- [ ] J'ai ajouté/mis à jour les commentaires dans le code

**Testing:**
- [ ] J'ai testé localement avec `npm run dev`
- [ ] J'ai testé le health check endpoint
- [ ] J'ai testé dans au moins 2 browsers différents
- [ ] J'ai testé sur mobile (si changements UI)

## 🚨 Breaking Changes

Cette PR introduit-elle des breaking changes ?

- [ ] Non
- [ ] Oui (détaillez ci-dessous)

**Si oui, décrivez:**
- Qu'est-ce qui va casser ?
- Comment les utilisateurs doivent-ils migrer ?
- Y a-t-il une période de dépréciation ?

## 📊 Performance

Cette PR impacte-t-elle les performances ?

- [ ] Amélioration des performances
- [ ] Dégradation des performances (justifiez)
- [ ] Pas d'impact
- [ ] Non testé

**Benchmarks (si applicable):**
- Avant : ...
- Après : ...

## 🔄 Migration Guide

Si cette PR nécessite des actions de la part des utilisateurs:

**Étapes de migration:**
1. ...
2. ...
3. ...

## 📝 Notes pour les Reviewers

Y a-t-il des aspects spécifiques où vous voulez un feedback ?

- Point 1 à reviewer particulièrement
- Point 2 nécessitant discussion
- Zone de code incertaine

## 🔮 Travail Futur

Cette PR ouvre-t-elle la porte à de futurs développements ?

- [ ] Feature complémentaire possible
- [ ] Refactor additionnel souhaitable
- [ ] Tests supplémentaires à ajouter

## 📎 Liens Additionnels

- Documentation de référence: ...
- Discussions liées: ...
- Inspirations: ...

---

## 🤝 Contributeur

**Première contribution ?**
- [ ] Oui, c'est ma première PR sur ce projet ! 🎉
- [ ] Non, j'ai déjà contribué

Si première fois, bienvenue ! N'hésitez pas à poser des questions.

---

**Merci pour votre contribution ! 🙏**

Un mainteneur va review votre PR sous 24-48h et vous donnera un feedback.

---

## 📋 Review Checklist (Pour Mainteneurs)

- [ ] Code respecte l'architecture NEXUS AXION 3.5
- [ ] Tests passent
- [ ] Pas de secrets hardcodés
- [ ] Documentation à jour
- [ ] CHANGELOG mis à jour
- [ ] Approuvé par au moins 1 mainteneur
- [ ] CI/CD checks passent