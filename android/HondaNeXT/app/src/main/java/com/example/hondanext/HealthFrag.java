package com.example.hondanext;

import android.os.Bundle;

import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;


public class HealthFrag extends Fragment {

    public HealthFrag() {
        // Required empty public constructor
    }





    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view=inflater.inflate(R.layout.fragment_health,container,false);
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_health, container, false);
    }
}