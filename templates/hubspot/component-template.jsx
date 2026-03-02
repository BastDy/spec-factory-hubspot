import React, { useState, useEffect } from "react";
import { hubspot, Button, Stats, Table, Alert } from "@hubspot/ui-extensions";

hubspot.extend(() => <[NomComposant] />);

const [NomComposant] = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    hubspot.actions.fetchCrmObjectProperties([
      "[prop_crm_1]",
      "[prop_crm_2]",
      "[prop_crm_3]"
    ])
      .then((properties) => {
        setData(properties);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (!data) {
    return <p>Aucune donnée disponible</p>;
  }

  return (
    <>
      <Stats label="[Label 1]" value={data.[prop_crm_1]} />
      <Stats label="[Label 2]" value={data.[prop_crm_2]} />
      <Stats label="[Label 3]" value={data.[prop_crm_3]} />

      <Button onClick={() => {
        // Action ici
        console.log("Action déclenchée");
      }}>
        [Texte Bouton]
      </Button>
    </>
  );
};
