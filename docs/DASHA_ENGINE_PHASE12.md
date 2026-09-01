# Advanced Dasha Engine: Multi-System Predictive Timing (Phase 12)

## 1. Supported Dasha Systems

```
                              [ Moon Sidereal Longitude ]
                                           |
                   +-----------------------+-----------------------+
                   |                       |                       |
                   v                       v                       v
        [ Vimshottari Dasha ]       [ Yogini Dasha ]       [ Ashtottari Dasha ]
           (120-Year Tree)          (36-Year Cycle)         (108-Year Cycle)
```

---

## 2. Dasha Mathematical Formulas

### 2.1 Vimshottari Dasha (120 Years)
- **Starting Lord**: Ruler of natal Moon Nakshatra ($N \in 1 \dots 27$).
- **Balance at Birth**:
  $$\text{Balance} = \left(1 - \frac{\text{Deg in Nakshatra}}{13^\circ 20'}\right) \times \text{Maha Period Years}$$
- **Hierarchical Levels**: Mahadasha $\to$ Antardasha $\to$ Pratyantardasha.

### 2.2 Yogini Dasha (36 Years)
- **Eight Yoginis**: Mangala (1y, Moon), Pingala (2y, Sun), Dhanya (3y, Jupiter), Bhramari (4y, Mars), Bhadrika (5y, Mercury), Ulka (6y, Saturn), Siddha (7y, Venus), Sankata (8y, Rahu).
- **Starting Index**:
  $$\text{Starting Index} = ((N + 3 - 1) \bmod 8)$$

### 2.3 Ashtottari Dasha (108 Years)
- **Eight Lords**: Sun (6y), Moon (15y), Mars (8y), Mercury (17y), Saturn (10y), Jupiter (19y), Rahu (12y), Venus (21y).
- **Nakshatra Partitioning**: 4 nakshatras for Sun, Mars, Saturn, Rahu; 3 nakshatras for Moon, Mercury, Jupiter, Venus.
