
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

type Language = "fr" | "en";

type ExpenseKey =
  | "rent"
  | "electricity"
  | "internet"
  | "heating"
  | "insurance"
  | "parking"
  | "laundry";

const COLORS = {
  background: "#FFF8F1",
  primary: "#B65C48",
  primaryDark: "#974634",
  peach: "#F4C4B1",
  text: "#33221F",
  muted: "#806B65",
  card: "#FFFCF8",
  white: "#FFFFFF",
  border: "#E9D5CC",
  disabled: "#F5EBE6",
  error: "#9B3030",
  errorBackground: "#FCE7E5",
};

const expenseKeys: ExpenseKey[] = [
  "rent",
  "electricity",
  "internet",
  "heating",
  "insurance",
  "parking",
  "laundry",
];

const utilityKeys: ExpenseKey[] = [
  "electricity",
  "internet",
  "heating",
];

const additionalKeys: ExpenseKey[] = [
  "insurance",
  "parking",
  "laundry",
];

const initialAmounts: Record<ExpenseKey, string> = {
  rent: "",
  electricity: "",
  internet: "",
  heating: "",
  insurance: "",
  parking: "",
  laundry: "",
};

const translations = {
  fr: {
    title: "Mon budget logement",
    subtitle:
      "Calculez vos dépenses de logement et votre part mensuelle.",
    location: "MONTRÉAL, QUÉBEC",
    housing: "Votre logement",
    utilities: "Services et énergie",
    additional: "Autres dépenses",
    rent: "Loyer mensuel",
    electricity: "Électricité",
    internet: "Internet",
    heating: "Chauffage",
    insurance: "Assurance habitation",
    parking: "Stationnement",
    laundry: "Buanderie",
    people: "Nombre de personnes",
    required: "Obligatoire",
    optional: "Facultatif",
    included: "Inclus dans le loyer",
    includedShort: "Inclus",
    estimate: "Votre estimation",
    total: "Coût mensuel total",
    perPerson: "Coût par personne",
    monthly: "par mois",
    breakdown: "Détail des dépenses",
    empty:
      "Indiquez votre loyer et le nombre de personnes pour voir votre estimation.",
    error:
      "Vérifiez les montants saisis. Le loyer doit être valide et le nombre de personnes doit être supérieur à zéro.",
    note:
      "Cette estimation suppose un partage égal des dépenses. Vérifiez les services inclus dans votre bail.",
    switchLanguage: "Switch to English",
  },
  en: {
    title: "My housing budget",
    subtitle:
      "Calculate your housing expenses and monthly share.",
    location: "MONTRÉAL, QUÉBEC",
    housing: "Your housing",
    utilities: "Utilities and services",
    additional: "Additional expenses",
    rent: "Monthly rent",
    electricity: "Electricity",
    internet: "Internet",
    heating: "Heating",
    insurance: "Tenant insurance",
    parking: "Parking",
    laundry: "Laundry",
    people: "Number of people",
    required: "Required",
    optional: "Optional",
    included: "Included in rent",
    includedShort: "Included",
    estimate: "Your estimate",
    total: "Total monthly cost",
    perPerson: "Cost per person",
    monthly: "per month",
    breakdown: "Expense breakdown",
    intro: "Leave optional expenses blank if they don't apply.",
    empty:
      "Enter the rent and number of people to see your estimate.",
    error:
      "Check the amounts entered. Rent must be valid and the number of people must be greater than zero.",
    note:
      "This estimate assumes everyone shares expenses equally. Check your lease for included services.",
    switchLanguage: "Passer en français",
  },
};

function parseAmount(value: string): number | null {
  const cleaned = value.trim().replace(",", ".");

  if (cleaned === "") return null;

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }

  const number = Number(cleaned);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

export default function BudgetCalculatorScreen() {
  // Declare width ONLY ONCE.
  const { width } = useWindowDimensions();

  // One column on phones and narrow windows.
  // Two columns on wider tablets and desktops.
  const isWide = width >= 760;

  const [language, setLanguage] = useState<Language>("fr");

  const [amounts, setAmounts] =
    useState<Record<ExpenseKey, string>>(initialAmounts);

  const [people, setPeople] = useState("");

  const [included, setIncluded] = useState<ExpenseKey[]>([]);

  const t = translations[language];

  const cardWidth: "100%" | "48.5%" =
    isWide ? "48.5%" : "100%";

  function updateAmount(key: ExpenseKey, value: string) {
    setAmounts((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function toggleIncluded(key: ExpenseKey) {
    setIncluded((previous) =>
      previous.includes(key)
        ? previous.filter((item) => item !== key)
        : [...previous, key]
    );
  }

  const rentValue = parseAmount(amounts.rent);
  const peopleValue = Number(people.trim());

  const validPeople =
    /^\d+$/.test(people.trim()) &&
    Number.isSafeInteger(peopleValue) &&
    peopleValue >= 1;

  const parsedAmounts = expenseKeys.map((key) => {
    if (key !== "rent" && included.includes(key)) {
      return { key, value: 0 };
    }

    if (key !== "rent" && amounts[key].trim() === "") {
      return { key, value: 0 };
    }

    return {
      key,
      value: parseAmount(amounts[key]),
    };
  });

  const validAmounts = parsedAmounts.every(
    (expense) => expense.value !== null
  );

  const hasRequiredInputs =
    amounts.rent.trim() !== "" && people.trim() !== "";

  const isValid =
    rentValue !== null &&
    validPeople &&
    validAmounts;

  const total = isValid
    ? parsedAmounts.reduce(
        (sum, expense) => sum + (expense.value ?? 0),
        0
      )
    : 0;

  const perPerson = isValid ? total / peopleValue : 0;

  function formatMoney(value: number) {
    return new Intl.NumberFormat(
      language === "fr" ? "fr-CA" : "en-CA",
      {
        style: "currency",
        currency: "CAD",
      }
    ).format(value);
  }

  function renderExpense(key: ExpenseKey) {
    const isIncluded =
      key !== "rent" && included.includes(key);

    return (
      <View key={key} style={styles.field}>
        <View style={styles.fieldHeader}>
          <Text style={styles.label}>{t[key]}</Text>
          <Text style={styles.currencyLabel}>CAD</Text>
        </View>

        <TextInput
          style={[
            styles.input,
            isIncluded && styles.disabledInput,
          ]}
          value={isIncluded ? "" : amounts[key]}
          onChangeText={(value) => updateAmount(key, value)}
          placeholder="0.00"
          placeholderTextColor="#B8A5A0"
          keyboardType="decimal-pad"
          editable={!isIncluded}
          accessibilityLabel={t[key]}
        />

        {key !== "rent" && (
          <Pressable
            style={styles.checkboxRow}
            onPress={() => toggleIncluded(key)}
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: isIncluded,
            }}
          >
            <View
              style={[
                styles.checkbox,
                isIncluded && styles.checkedCheckbox,
              ]}
            >
              {isIncluded && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>

            <Text style={styles.checkboxLabel}>
              {t.included}
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  function renderSectionHeader(
    number: string,
    title: string,
    subtitle: string
  ) {
    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionNumber}>
          <Text style={styles.sectionNumberText}>
            {number}
          </Text>
        </View>

        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>
            {title}
          </Text>
          <Text style={styles.sectionHint}>
            {subtitle}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: width < 370 ? 12 : 18,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* PAGE HEADER */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              {t.location}
            </Text>

            <Text style={styles.title}>
              {t.title}
            </Text>

            <Text style={styles.subtitle}>
              {t.subtitle}
            </Text>
          </View>

          <Pressable
            style={styles.languageButton}
            accessibilityRole="button"
            accessibilityLabel={t.switchLanguage}
            onPress={() =>
              setLanguage((previous) =>
                previous === "fr" ? "en" : "fr"
              )
            }
          >
            <Text style={styles.languageText}>
              {language === "fr" ? "EN" : "FR"}
            </Text>
          </Pressable>
        </View>

        

        {/* RESPONSIVE CARDS */}
        <View style={styles.cardsContainer}>
          {/* HOUSING CARD */}
          <View
            style={[
              styles.card,
              { width: cardWidth },
            ]}
          >
            {renderSectionHeader(
              "01",
              t.housing,
              t.required
            )}

            {renderExpense("rent")}

            <View style={styles.field}>
              <Text style={styles.label}>
                {t.people}
              </Text>

              <TextInput
                style={[styles.input, { marginTop: 9 }]}
                value={people}
                onChangeText={setPeople}
                placeholder="1, 2, 3..."
                placeholderTextColor="#B8A5A0"
                keyboardType="number-pad"
                accessibilityLabel={t.people}
              />
            </View>
          </View>

          {/* ESTIMATE: VISIBLE EARLY ON MOBILE */}
          <View
            style={[
              styles.summaryCard,
              { width: cardWidth },
            ]}
          >
            <Text style={styles.summaryEyebrow}>
              NOTRE COLOC
            </Text>

            <Text style={styles.summaryTitle}>
              {t.estimate}
            </Text>

            {!hasRequiredInputs ? (
              <View style={styles.summaryMessage}>
                <Text style={styles.summaryMessageText}>
                  {t.empty}
                </Text>
              </View>
            ) : !isValid ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>
                  {t.error}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>
                    {t.total}
                  </Text>

                  <Text style={styles.totalValue}>
                    {formatMoney(total)}
                  </Text>

                  <Text style={styles.monthlyLabel}>
                    {t.monthly}
                  </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>
                    {t.perPerson}
                  </Text>

                  <Text style={styles.personValue}>
                    {formatMoney(perPerson)}
                  </Text>

                  <Text style={styles.monthlyLabel}>
                    {t.monthly}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* UTILITIES CARD */}
          <View
            style={[
              styles.card,
              { width: cardWidth },
            ]}
          >
            {renderSectionHeader(
              "02",
              t.utilities,
              t.optional
            )}

            {utilityKeys.map(renderExpense)}
          </View>

          {/* OTHER EXPENSES CARD */}
          <View
            style={[
              styles.card,
              { width: cardWidth },
            ]}
          >
            {renderSectionHeader(
              "03",
              t.additional,
              t.optional
            )}

            {additionalKeys.map(renderExpense)}
          </View>
        </View>

        {/* BREAKDOWN */}
        {isValid && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>
              {t.breakdown}
            </Text>

            {parsedAmounts.map((expense) => {
              const isIncluded =
                expense.key !== "rent" &&
                included.includes(expense.key);

              return (
                <View
                  key={expense.key}
                  style={styles.breakdownRow}
                >
                  <View style={styles.breakdownText}>
                    <Text style={styles.breakdownLabel}>
                      {t[expense.key]}
                    </Text>

                    {isIncluded && (
                      <Text style={styles.includedBadge}>
                        {t.includedShort}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.breakdownAmount}>
                    {formatMoney(expense.value ?? 0)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.disclaimer}>
          {t.note}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingTop: 105,
    paddingBottom: 65,
    alignItems: "center",
  },

  content: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: COLORS.primary,
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 21,
  },

  languageButton: {
    backgroundColor: COLORS.primary,
    minWidth: 48,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  languageText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },



  cardsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },

  sectionNumber: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FCEAE1",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionNumberText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },

  sectionHint: {
    fontSize: 12,
    color: COLORS.muted,
  },

  field: {
    marginBottom: 18,
  },

  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    flexShrink: 1,
  },

  currencyLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  input: {
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    color: COLORS.text,
  },

  disabledInput: {
    backgroundColor: COLORS.disabled,
    opacity: 0.7,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 9,
    minHeight: 38,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  checkedCheckbox: {
    backgroundColor: COLORS.primary,
  },

  checkmark: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.white,
  },

  checkboxLabel: {
    fontSize: 13,
    color: COLORS.muted,
    flexShrink: 1,
  },

  summaryCard: {
    backgroundColor: COLORS.text,
    borderRadius: 20,
    padding: 23,
    minHeight: 255,
  },

  summaryEyebrow: {
    color: COLORS.peach,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 10,
  },

  summaryTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 22,
  },

  summaryMessage: {
    backgroundColor: "#49332D",
    padding: 16,
    borderRadius: 12,
  },

  summaryMessageText: {
    color: "#F5E6DF",
    fontSize: 14,
    lineHeight: 21,
  },

  summaryBlock: {
    marginBottom: 6,
  },

  summaryLabel: {
    color: "#E5CFC5",
    fontSize: 13,
    marginBottom: 6,
  },

  totalValue: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: "800",
  },

  personValue: {
    color: COLORS.peach,
    fontSize: 33,
    fontWeight: "800",
  },

  monthlyLabel: {
    color: "#D9BCB0",
    fontSize: 12,
    marginTop: 4,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#74574F",
    marginVertical: 17,
  },

  errorCard: {
    backgroundColor: COLORS.errorBackground,
    padding: 15,
    borderRadius: 12,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 20,
  },

  breakdownCard: {
    marginTop: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 20,
  },

  breakdownTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },

  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E2DA",
  },

  breakdownText: {
    flex: 1,
    gap: 4,
  },

  breakdownLabel: {
    color: COLORS.text,
    fontSize: 14,
  },

  includedBadge: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  },

  breakdownAmount: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },

  disclaimer: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 22,
    paddingHorizontal: 10,
  },
});
