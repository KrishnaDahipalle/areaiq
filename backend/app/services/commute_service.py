class CommuteService:

    COMMUTE_MATRIX = {
        "mindspace": {
            "madhapur": 10,
            "hitech_city": 10,
            "kondapur": 9,
            "gachibowli": 8,
            "manikonda": 7,
            "miyapur": 5,
            "kukatpally": 4
        },

        "financial_district": {
            "financial_district": 10,
            "kokapet": 9,
            "narsingi": 9,
            "gachibowli": 8,
            "tellapur": 7,
            "kondapur": 6
        }
    }

    def get_commute_score(
        self,
        office_location: str,
        locality: str
    ):

        office = office_location.lower()
        locality = locality.lower()

        return (
            self.COMMUTE_MATRIX
            .get(office, {})
            .get(locality, 5)
        )


commute_service = CommuteService()