// Serverless function HubSpot
// Appelée depuis les UI Extensions

exports.main = async (context) => {
  const { parameters } = context;

  try {
    // Logique métier ici
    // Exemple : appel API externe, calcul, transformation données

    const result = {
      success: true,
      data: {
        // Résultat à retourner
      }
    };

    return result;

  } catch (error) {
    console.error("Erreur fonction serverless:", error);

    return {
      success: false,
      error: error.message
    };
  }
};
